import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto, CreateReferralDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';
import { ChallengeService } from 'src/challenge/challenge.service';
import { Status } from 'src/challenge/entities/challenge.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly challengeService: ChallengeService,
    //private readonly notificationService: NotificationService

  ) {}

  async requestWithdrawal(userId: number, takerId: number, dto: CreatePaymentDto) {
    try {
      const user = await this.userService.findById(userId);

    if (!user) throw new NotFoundException('User not found');

    const taker = await this.challengeService.findTake(takerId);

    if(!taker || taker.user.id !== userId) {
      throw new BadRequestException('Invalid taker ID');
    }

    if (taker.status === Status.WITHDRAWN) {
      throw new BadRequestException(
        'Funds already withdrawn for this challenge.',
      );
    }
    
    const challengeCompleted =
      taker.status === Status.COMPLETED && taker.phase === 3;
    
    // if (!challengeCompleted) {
    //   throw new BadRequestException(
    //     'Challenge not completed. Withdrawal not allowed.',
    //   );
    // }


    const profitCalculation =  taker.challenge.profitTarget - taker.amount;
    const finalAmount = 0.90 * profitCalculation;

    const withdrawal = this.paymentRepository.create({
      user,
      amount: finalAmount,
      method: dto.method,
      cryptoAddress: dto.cryptoAddress,
      bankName: dto.bankName,
      accountName: dto.accountName,
      accountNumber: dto.accountNumber,
      challenge: taker,
    });


    const add = await this.userService.addUserPayment(userId, withdrawal);

    if (!add) {
      throw new BadRequestException('Issue creating withdrawal.');
    }

    await this.mailService.sendWithdrawalConfirmation(user.email, user.fullName, taker.amount, PaymentStatus.PENDING,dto.method);
    await this.mailService.sendAdminWithdrawalAlert(user.fullName, taker.amount, PaymentStatus.PENDING)

    
    return this.paymentRepository.save(withdrawal);
    } catch (error) {
      throw error;
    }
    
  }

  async referralWithdrawal(userId: number, dto: CreateReferralDto) {
    try {
      const user = await this.userService.findById(userId);

    if (!user) throw new NotFoundException('User not found');

    if( dto.amount > user.accountBalance) {  
      throw new BadRequestException('Insufficient referral balance.');
    }
    const withdrawal = this.paymentRepository.create({
      user,
      amount: dto.amount,
      method: dto.method,
      cryptoAddress: dto.cryptoAddress,
      bankName: dto.bankName,
      accountName: dto.accountName,
      accountNumber: dto.accountNumber,
    });
    const add = await this.userService.addUserPayment(userId, withdrawal);
    if (!add) {
      throw new BadRequestException('Issue creating withdrawal.');
    }

    await this.userService.decreaseUserBalance(withdrawal.user.id, withdrawal.amount);
    await this.mailService.sendWithdrawalConfirmation(user.email, user.fullName, dto.amount, PaymentStatus.PENDING,dto.method);
    await this.mailService.sendAdminWithdrawalAlert(user.fullName, dto.amount, PaymentStatus.PENDING)
    return this.paymentRepository.save(withdrawal);
    } catch (error) {
      throw error;
    }
  }

  async getUserWithdrawals(userId: number) {
    return this.paymentRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async approveWithdrawal(id: number) {
    try {
      const withdrawal = await this.paymentRepository.findOne({ where: { id },relations: ['user', "challenge"] });
    if (!withdrawal) throw new NotFoundException('Withdrawal not found');


    if( withdrawal.status === PaymentStatus.APPROVED || withdrawal.status === PaymentStatus.REJECTED) {
      throw new BadRequestException('Payment already processed');
    }
    
    withdrawal.status = PaymentStatus.APPROVED;

    
    await this.mailService.sendUserWithdrawalApproved(withdrawal.user.email, withdrawal.user.fullName, withdrawal.amount, PaymentStatus.APPROVED, withdrawal.method);

    await this.challengeService.updateStatus(withdrawal.challenge.id);
    
    return this.paymentRepository.save(withdrawal);
    } catch (error) {
      throw error;
    }
    
  }

  async rejectWithdrawal(id: number) {
    const withdrawal = await this.paymentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!withdrawal) throw new NotFoundException('Withdrawal not found');

    if( withdrawal.status === PaymentStatus.APPROVED || withdrawal.status === PaymentStatus.REJECTED) {
      throw new BadRequestException('payment already processed');
    }

    withdrawal.status = PaymentStatus.REJECTED;

  
    return this.paymentRepository.save(withdrawal);
  }

  

  async findAll(): Promise<Payment[]> {
    try {
      const deposits = await this.paymentRepository.find({
        relations: ['user'],
      });
      if (!deposits || deposits.length === 0) {
        throw new BadRequestException('No deposits found.');
      }
      return deposits;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number): Promise<Payment> {
    try {
      const withdraw = await this.paymentRepository.findOne({
        where: { id },
        relations: ['user'],
      });
      if (!withdraw) {
        throw new NotFoundException('Withdraw not found');
      }
      return withdraw;
    } catch (error) {
      throw error;
    }
  }

  async findByUser(
        userId: number,
        page = 1,
        limit = 10,
      ): Promise<{ data: Payment[]; total: number }> {
        const [data, total] = await this.paymentRepository.findAndCount({
          where: {
            user: { id: userId },
          },
          order: { createdAt: 'DESC' },
          skip: (page - 1) * limit,
          take: limit,
        });
      
        return { data, total };
      }

  async getAll(): Promise<Payment[]> {
    try {
      const withdraws = await this.paymentRepository.find({
        relations: ['user'],
      });
      if (!withdraws || withdraws.length === 0) {
        throw new BadRequestException('No withdrawals found.');
      }
      return withdraws;
    } catch (error) {
      throw error;
    }
  }
  // update(id: number, updateWithdrawDto: UpdateWithdrawDto) {
  //   return `This action updates a #${id} withdraw`;
  // }

  remove(id: number) {
    return `This action removes a #${id} withdraw`;
  }
}
