import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';
import { Challenge, Taker } from './entities/challenge.entity';

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

  // async addStaker(stakingId: number, userId: number, addStakerDto: AddStakerDto,image:string | null): Promise<Staking> {
  //   const staking = await this.stakingRepository.findOne({ where: { id: stakingId }, relations: ['stakers'] });
  //   if (!staking) {
  //     throw new NotFoundException(`Staking with ID "${stakingId}" not found`);
  //   }
    
  //   // Find the user who is making the request
  //   const user = await this.userService.findById(userId);
  //   if (!user) {
  //     throw new NotFoundException('User not found.');
  //   }

  //   const newStaker = this.stakerRepository.create({
  //     stakedAmount: addStakerDto.stakedAmount,
  //     receiptUrl: image ?? '',
  //     staking,
  //     user, // Associate the user entity
  //   });

  //   staking.stakers.push(newStaker);

  //   await this.stakerRepository.save(newStaker);

  //   await this.stakingRepository.save(staking);

  //   await this.userService.addUserStaking(userId, staking);


  //   await this.mailService.sendStakeEmail(user.email,user.fullName,addStakerDto.stakedAmount,staking.stakeName);
  //   await this.mailService.sendStakeEmailAdmin(user.fullName,addStakerDto.stakedAmount,staking.stakeName)

  //   // Refresh the staking entity to include the new staker
  //   return staking;
  // }

  // async approveStake(stakerId: number): Promise<Staker> {
  //   const stake = await this.stakerRepository.findOneBy({ id: stakerId });
  //   if (!stake) {
  //     throw new NotFoundException(`Stake entry with ID "${stakerId}" not found.`);
  //   }

  //   if (stake.status !== Status.PENDING) {
  //     throw new BadRequestException(`Stake is already in status "${stake.status}" and cannot be approved.`);
  //   }

  //   stake.status = Status.ACTIVE;
  //   return this.stakerRepository.save(stake);
  // }

  // async addReward(stakerId: number, addRewardDto: AddRewardDto): Promise<Staker> {
  //   const stake = await this.stakerRepository.findOneBy({ id: stakerId });
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

  // async claimStake(stakerId: number, userId: number, claimStakeDto: ClaimStakeDto): Promise<Staker> {
  //   // Find the specific stake entry
  //   const stake = await this.stakerRepository.findOne({
  //     where: { id: stakerId },
  //     relations: ['user','staking'], // Ensure the user relation is loaded
  //   });

  //   if (!stake) {
  //     throw new NotFoundException(`Stake entry with ID "${stakerId}" not found.`);
  //   }

  //   // Security check: Ensure the user owns this stake
  //   if (stake.user.id !== userId) {
  //     throw new UnauthorizedException('You do not have permission to claim this stake.');
  //   }

  //   // Business logic: A user can only claim an ACTIVE stake
  //   if (stake.status !== Status.ACTIVE) {
  //     throw new BadRequestException(`Only ACTIVE stakes can be claimed. Current status is "${stake.status}".`);
  //   }

  //   // Update the stake's status and add the withdrawal address
  //   stake.status = Status.CLOSED;
  //   stake.withdrawalWallet = claimStakeDto.withdrawalWalletAddress;

  //   await this.mailService.sendClaimEmailAdmin(stake.user.fullName,stake.staking.stakeName)

  //   return this.stakerRepository.save(stake);
  // }

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

  // async findAll(): Promise<Staking[]> {
  //   return this.stakingRepository.find({ relations: ['stakers'] });
  // }

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

