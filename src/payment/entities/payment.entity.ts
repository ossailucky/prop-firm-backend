import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Taker } from 'src/challenge/entities/challenge.entity';

export enum PaymentMethod {
    ETH = 'ETH',
    USDT = 'USDT',
    BTC = 'BTC',
    LITE = 'LITECOIN',
    BANK_TRANSFER = 'BANK_TRANSFER',
  }
  
  export enum PaymentStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
  }

  @Entity("payments")
export class Payment {
    @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @Column({ nullable: true })
  cryptoAddress?: string;

  @Column({ nullable: true })
  bankName?: string;

  @Column({ nullable: true })
  accountNumber?: string;

  @Column({ nullable: true })
  accountName?: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @ManyToOne(() => Taker, (challenge) => challenge.payment)
  challenge: Taker;

  @CreateDateColumn()
  createdAt: Date;
}





