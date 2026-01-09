import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChallengeDto, RequestReviewDto, TradingLoginDetailsDTO } from './dto/create-challenge.dto';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';
import { Challenge, Status, Taker, TradingLoginDetails } from './entities/challenge.entity';
import crypto from "crypto";

@Injectable()
export class ChallengeService {
  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,
    @InjectRepository(Taker)
    private readonly takerRepository: Repository<Taker>,
    @InjectRepository(TradingLoginDetails)
    private readonly tradingRepository: Repository<TradingLoginDetails>,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  async create(createChallengeDto: CreateChallengeDto, ): Promise<Challenge> {
    try {
      const { amount, profitTarget, dailyLossLimit, fee, maxDrawdown, phaseOne,phaseTwo, phaseThree, oneTimeFee, minBenchmark} = createChallengeDto;

      const challenge = this.challengeRepository.create({
        amount,
        profitTarget,
        dailyLossLimit,
        fee,
        maxDrawdown,
        phaseOne,
        phaseTwo,
        phaseThree,
        oneTimeFee,
        minBenchmark
      });

      return this.challengeRepository.save(challenge);
    } catch (error) {
      throw error;
      
    }
  }

  async addTaker(challengeId: number, userId: number,paymentMedium:string,image:string | null): Promise<Challenge> {
    const challenge = await this.challengeRepository.findOne({ where: { id: challengeId }, relations: ['takers'] });

    const active = await this.takerRepository.find({
      where: {
        user: { id: userId }, 
        status: Status.PENDING || Status.ACTIVE || Status.REVIEW,
        
       },
      relations: ['user', 'challenge'], // Load relations to give full context
    });

    if(active.length > 0){
      throw new BadRequestException('You have an ongoing challenge, you cannot take another challenge at the moment');
    }

    if (!challenge) {
      throw new NotFoundException(`taking with ID "${challengeId}" not found`);
    }
    
    // Find the user who is making the request
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if(user.isEmailVerified === false){
      throw new BadRequestException('Your email is not verifield yet, please verify your email');
    }

  
    const newTaker = this.takerRepository.create({
      amount: challenge.amount,
      receiptUrl: image ?? '',
      paymentMedium: paymentMedium,
      fee: challenge.fee,
      challenge,
      phase: 1,
      user, // Associate the user entity
    });

    challenge.takers.push(newTaker);

    await this.takerRepository.save(newTaker);

    await this.challengeRepository.save(challenge);

    


   // await this.mailService.sendStakeEmail(user.email,user.fullName,challenge.amount);
    await this.mailService.sendStakeEmailAdmin(user.fullName,challenge.amount)

    // Refresh the staking entity to include the new staker
    return challenge;
  }

  async approveChallenge(takerId: number): Promise<Taker> {
    const take = await this.takerRepository.findOne({ where:{id: takerId}, relations: ['user']  } );
    if (!take) {
      throw new NotFoundException(`take entry with ID "${takerId}" not found.`);
    }

    if (take.status !== Status.PENDING) {
      throw new BadRequestException(`take is already in status "${take.status}" and cannot be approved.`);
    }

    take.status = Status.ACTIVE;
    take.phase = 1;

    const referee = await this.userService.findByrefferalCode(take.user.referralCode);

    if(referee){
      const bonusAmount = (take.fee * 10) / 100; // 10% of the challenge fee
      await this.userService.increaseUserBalance(referee.id, bonusAmount);
      await this.mailService.sendRefferralBonus(referee.email,referee.fullName,take.user.fullName,bonusAmount);

      await this.userService.updateReferee(take.user.id);
      return this.takerRepository.save(take);
    }
    return this.takerRepository.save(take);
  }

  // async addReward(stakerId: number, addRewardDto: AddRewardDto): Promise<Staker> {
  //   const stake = await this.takerRepository.findOneBy({ id: stakerId });
  //   if (!stake) {
  //     throw new NotFoundException(`Stake entry with ID "${stakerId}" not found.`);
  //   }

  //   if (stake.status !== Status.ACTIVE) {
  //       throw new BadRequestException(`Rewards can only be added to ACTIVE stakes.`);
  //   }

  //   // Use query builder's increment for an atomic and safe update

  //   const newRewards = Number(stake.rewards) + Number(addRewardDto.rewardAmount);
  //   if (newRewards < 0) {
  //       throw new BadRequestException(`Rewards cannot be negative.`);
  //   }
  //   stake.rewards = newRewards;
  //   const saved = await this.stakerRepository.save(stake);

  //   return saved;

  //   // await this.stakerRepository.increment(
  //   //   { id: stakerId },
  //   //   'rewards',
  //   //   addRewardDto.rewardAmount,
  //   // );

  //   // // Return the updated entity
  //   // const returnState = await this.stakerRepository.findOneBy({ id: stakerId });

  //   // return returnState!;
  // }

  async requestReview(takerId: number, userId: number, reviewDto: RequestReviewDto): Promise<String> {
    // Find the specific stake entry
    const take = await this.takerRepository.findOne({
      where: { id: takerId },
      relations: ['user','challenge'], // Ensure the user relation is loaded
    });

    if (!take) {
      throw new NotFoundException(`take entry with ID "${takerId}" not found.`);
    }

    // Security check: Ensure the user owns this stake
    if (take.user.id !== userId) {
      throw new UnauthorizedException('You do not have permission to claim this stake.');
    }

    // Business logic: A user can only claim an ACTIVE stake
    if (take.status !== Status.ACTIVE) {
      throw new BadRequestException(`Only ACTIVE stakes can be claimed. Current status is "${take.status}".`);
    }

    take.status = Status.REVIEW;

    await this.takerRepository.save(take);

    await this.mailService.sendReviewRequestAdmin(take.user.fullName,take.challenge.amount,take.phase)

    return "your review request has been submitted;"
  }

  async sendTradingLoginByEmail(takerId: number, dto:TradingLoginDetailsDTO): Promise<any> {
    try {
      const { serverName, loginID,  password} = dto;
      const taker = await this.takerRepository.findOne({ where: { id: takerId },relations: ['user','challenge'], });
      if (!taker) throw new NotFoundException('Challenge not found');

     const tradingDetails = await this.tradingRepository.create({
        serverName: serverName,
        loginID: loginID,
        password: password,
        user:taker.user,
      })

       await this.tradingRepository.save(tradingDetails);
      await this.mailService.tradingDetailsMessage(taker.user.email, taker.user.fullName,loginID, password, serverName);
      return { message: 'Login Details sent successfully' };
    } catch (error) {
      throw error;
    }
  }


  async getTradingDetails(userId:number): Promise<any>{
    try {
      const details = this.tradingRepository.findOne({ 
        where: {
          user: { id: userId },
        },
        relations: [ 'user'] });

        if (!details) throw new NotFoundException('Trading details not found');
        return details;
    } catch (error) {
      throw error;
    }
  }

  async confirmPhase(takerId: number): Promise<Taker> {
    try {
      const take = await this.takerRepository.findOne({
        where: { id: takerId },
        relations: ['user','challenge'], // Ensure the user relation is loaded
      });
      
         
      
      if (!take) {
        throw new NotFoundException(`take entry with ID "${takerId}" not found.`);
      }
  
      // Admin can only approve stakes that are in the CLOSED (withdrawal requested) state
      if (take.status !== Status.REVIEW) {
        throw new BadRequestException(`Only challenges with status REVIEW can be updated. Current status is "${take.status}".`);
      }

      if(take.phase >=3){
        take.status = Status.COMPLETED;
        await this.mailService.challengeCompleted(take.user.email,take.user.fullName,take.amount,take.phase,take.profit,'COMPLETED');
        return this.takerRepository.save(take);
      }
  
      take.status = Status.ACTIVE;
      
      take.phase = take.phase + 1;

      const message = `Congratulations! You have successfully completed Phase " ${take.phase -1}   of your challenge. Get ready for Phase ${take.phase}. Keep up the great work!`;
      
      await this.mailService.confirmChallengePhase(take.user.email,take.user.fullName,message);
      
      return this.takerRepository.save(take);
    } catch (error) {
      throw error;
      
    }
    
  }


  async failPhaseConfirm(takerId: number): Promise<Taker> {
    try {
      const take = await this.takerRepository.findOne({
        where: { id: takerId },
        relations: ['user','challenge'], // Ensure the user relation is loaded
      });
      
         
      
      if (!take) {
        throw new NotFoundException(`take entry with ID "${takerId}" not found.`);
      }
  
      // Admin can only approve stakes that are in the CLOSED (withdrawal requested) state
      if (take.status !== Status.REVIEW) {
        throw new BadRequestException(`Only challenges with status REVIEW can be updated. Current status is "${take.status}".`);
      }

      if(take.phase >3){
        take.status = Status.COMPLETED;
        await this.mailService.challengeCompleted(take.user.email,take.user.fullName,take.amount,take.phase,take.profit,'COMPLETED');
        return this.takerRepository.save(take);
      }
  
      take.status = Status.ACTIVE;
      

      const message = `You've not meet the trading Profit Threshold for the Next phase, please continue trading  ${take.phase}  to meet the required benchmark. You can do this!`;
      
      await this.mailService.confirmChallengePhase(take.user.email,take.user.fullName,message);
      
      return this.takerRepository.save(take);
    } catch (error) {
      throw error;
      
    }
    
  }

  generateSecureCode(length = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from(crypto.randomBytes(length))
      .map(b => chars[b % chars.length])
      .join("");
  }

  // async update(id: number, dto: UpdateStakingDto): Promise<Staking> {
  //   const staking = await this.stakingRepository.findOneBy({ id });
  
  //   if (!staking) throw new NotFoundException('Staking not found');
  
  //   // Apply fields
  //   Object.assign(staking, dto);
  
  //   return this.stakingRepository.save(staking);
  // }
 

  async findTakersByStatus(status: Status): Promise<Taker[]> {
    try {
      return this.takerRepository.find({
        where: { status },
        relations: ['user', 'challenge'], // Load relations to give full context
      });
    } catch (error) {
      throw error;
      
    }
    
  }

  async findOneTakerByStatus(userId: number): Promise<Taker[]> {
    try {
      return this.takerRepository.find({
        where: {
          user: { id: userId }, 
          status: Status.ACTIVE,
          
         },
        relations: ['user', 'challenge'], // Load relations to give full context
      });
    } catch (error) {
      throw error;
      
    }
    
  }

  async findOneCompletedTaker(userId: number): Promise<Taker[]> {
    try {
      return this.takerRepository.find({
        where: {
          user: { id: userId }, 
          status: Status.COMPLETED,
          
         },
        relations: ['user', 'challenge'], // Load relations to give full context
      });
    } catch (error) {
      throw error;
      
    }
    
  }

  async updateStatus(takerId: number): Promise<Taker> {
    const take = await this.takerRepository.findOne({ where:{id: takerId} } );
    if (!take) {
      throw new NotFoundException(`take entry with ID "${takerId}" not found.`);
    }

    take.status = Status.WITHDRAWN;

    return this.takerRepository.save(take);
  }

  async findTakers(): Promise<Taker[]> {
    try {
      return this.takerRepository.find({
        relations: ['user', 'challenge'], // Load relations to give full context
        order:{id: 'DESC'}
      });
    } catch (error) {
      throw error;
      
    }
    
  }

  async findAll(): Promise<Challenge[]> {

    try {
      return this.challengeRepository.find({
        // relations: ['takers'], // Load relations to give full context
        order:{id: 'DESC'}
      });
    } catch (error) {
      throw error;
      
    }
  }

  async findAllByUser(userId: number): Promise<Taker[]> {
    try { 
      const stakes = this.takerRepository.find({ 
        where: {
          user: { id: userId },
        },
        relations: ['challenge', 'user'] });

        if (!stakes) {
          throw new NotFoundException(`No takes found for user with ID "${userId}"`);
        }
        return stakes; 
    } catch (error) {
      throw error;
      
    }
    
  }

  // async findOne(id: number): Promise<Staking> {
  //   const staking = await this.stakingRepository.findOne({ where: { id }, relations: ['stakers'] });
  //   if (!staking) {
  //     throw new NotFoundException(`Staking with ID "${id}" not found`);
  //   }
  //   return staking;
  // }

  async findTake(id: number): Promise<Taker> {
    const take = await this.takerRepository.findOne({ where: { id }, relations: ['challenge','user'] });
    if (!take) {
      throw new NotFoundException(`taking with ID "${id}" not found`);
    }
    return take;
  }


  // async remove(id: number): Promise<void> {
  //   try {
  //     const stake = await this.stakingRepository.findOne({ where: { id } });
  //       if (!stake) {
  //         throw new NotFoundException(`Staking with ID "${id}" not found`);
  //       }

  //       await this.stakerRepository.delete({ staking: stake }); // Delete related stakers first

  //       await this.stakingRepository.remove(stake);
  //   } catch (error) {
  //     throw error;
      
  //   }
    
  // }

}

