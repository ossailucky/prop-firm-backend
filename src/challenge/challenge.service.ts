import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChallengeDto, RequestReviewDto } from './dto/create-challenge.dto';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';
import { Challenge, Status, Taker } from './entities/challenge.entity';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,
    @InjectRepository(Taker)
    private readonly takerRepository: Repository<Taker>,
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
    if (!challenge) {
      throw new NotFoundException(`Staking with ID "${challengeId}" not found`);
    }
    
    // Find the user who is making the request
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const newTaker = this.takerRepository.create({
      amount: challenge.amount,
      receiptUrl: image ?? '',
      paymentMedium: paymentMedium,
      fee: challenge.fee,
      challenge,
      user, // Associate the user entity
    });

    challenge.takers.push(newTaker);

    await this.takerRepository.save(newTaker);

    await this.challengeRepository.save(challenge);

    // await this.userService.addUserStaking(userId, staking);


    await this.mailService.sendStakeEmail(user.email,user.fullName,challenge.amount);
    await this.mailService.sendStakeEmailAdmin(user.fullName,challenge.amount)

    // Refresh the staking entity to include the new staker
    return challenge;
  }

  async approveChallenge(takerId: number): Promise<Taker> {
    const take = await this.takerRepository.findOneBy({ id: takerId });
    if (!take) {
      throw new NotFoundException(`take entry with ID "${takerId}" not found.`);
    }

    if (take.status !== Status.PENDING) {
      throw new BadRequestException(`take is already in status "${take.status}" and cannot be approved.`);
    }

    take.status = Status.ACTIVE;
    take.phase = 1;
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

    

    await this.mailService.sendReviewRequestAdmin(take.user.fullName,take.challenge.amount,take.phase)

    return "your review request has been submitted;"
  }

  // async approveClaim(stakerId: number): Promise<Staker> {
  //   try {
  //     const stake = await this.stakerRepository.findOne({
  //       where: { id: stakerId },
  //       relations: ['user','staking'], // Ensure the user relation is loaded
  //     });
  //     if (!stake) {
  //       throw new NotFoundException(`Stake entry with ID "${stakerId}" not found.`);
  //     }
  
  //     // Admin can only approve stakes that are in the CLOSED (withdrawal requested) state
  //     if (stake.status !== Status.CLOSED) {
  //       throw new BadRequestException(`Only stakes with status CLOSED can be approved. Current status is "${stake.status}".`);
  //     }
  
  //     stake.status = Status.COMPLETED;
      
  //     const amountToCredit = Number(stake.stakedAmount) + Number(stake.rewards);
  //     await this.mailService.sendUserClaimApproved(stake.user.email,stake.user.fullName,amountToCredit,stake.staking.stakeName,stake.status);
      
  //     return this.stakerRepository.save(stake);
  //   } catch (error) {
  //     throw error;
      
  //   }
    
  // }

  // async update(id: number, dto: UpdateStakingDto): Promise<Staking> {
  //   const staking = await this.stakingRepository.findOneBy({ id });
  
  //   if (!staking) throw new NotFoundException('Staking not found');
  
  //   // Apply fields
  //   Object.assign(staking, dto);
  
  //   return this.stakingRepository.save(staking);
  // }
 

  // async findStakersByStatus(status: Status): Promise<Staker[]> {
  //   try {
  //     return this.stakerRepository.find({
  //       where: { status },
  //       relations: ['user', 'staking'], // Load relations to give full context
  //     });
  //   } catch (error) {
  //     throw error;
      
  //   }
    
  // }

  // async findStakers(): Promise<Staker[]> {
  //   try {
  //     return this.stakerRepository.find({
  //       relations: ['user', 'staking'], // Load relations to give full context
  //       order:{id: 'DESC'}
  //     });
  //   } catch (error) {
  //     throw error;
      
  //   }
    
  // }

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

  // async findAllByUser(userId: number): Promise<Staker[]> {
  //   try { 
  //     const stakes = this.stakerRepository.find({ 
  //       where: {
  //         user: { id: userId },
  //       },
  //       relations: ['staking', 'user'] });

  //       if (!stakes) {
  //         throw new NotFoundException(`No stakes found for user with ID "${userId}"`);
  //       }
  //       return stakes; 
  //   } catch (error) {
  //     throw error;
      
  //   }
    
  // }

  // async findOne(id: number): Promise<Staking> {
  //   const staking = await this.stakingRepository.findOne({ where: { id }, relations: ['stakers'] });
  //   if (!staking) {
  //     throw new NotFoundException(`Staking with ID "${id}" not found`);
  //   }
  //   return staking;
  // }

  // async findStake(id: number): Promise<Staker> {
  //   const stake = await this.stakerRepository.findOne({ where: { id }, relations: ['staking','user'] });
  //   if (!stake) {
  //     throw new NotFoundException(`Staking with ID "${id}" not found`);
  //   }
  //   return stake;
  // }


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

