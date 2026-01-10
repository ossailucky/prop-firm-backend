import { Payment } from 'src/payment/entities/payment.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';

export enum Status {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE', 
    CLOSED = 'CLOSED',
    REVIEW = "REVIEW",
    COMPLETED = "COMPLETED",
    WITHDRAWN = "WITHDRAWN",
    REJECTED = "REJECTED"
    
  }

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;
      
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  profitTarget: number;
  
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  dailyLossLimit: number;
  
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDrawdown: number;
  
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fee: number;
      
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  phaseOne: number;
  
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })   
  phaseTwo?: number;
  
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  phaseThree?: number;
      
  @Column({default:""})
  oneTimeFee?: string;
  
  @Column({default: ""})
  minBenchmark?: string;

  @OneToMany(() => Taker, taker => taker.challenge, { cascade: true })
  takers: Taker[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


@Entity()
export class Taker {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column('decimal', { precision: 15, scale: 2 })
    amount: number;
  
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    profit: number;

    @Column('decimal', { precision: 15, scale: 2 })
    fee: number;

    @Column({ nullable: true })
    phase: number;
  
    @ManyToOne(() => Challenge, challenge => challenge.takers,{ onDelete: 'CASCADE' })
    challenge: Challenge;

    @Column({
        type: 'enum',
        enum: Status,
        default: Status.PENDING,
      })
    status: Status;

    @Column()
    paymentMedium: string;

    @ManyToOne(() => Payment, pay => pay.challenge, { onDelete: 'SET NULL' })
    payment: Payment;

    @Column({ nullable: true })
    receiptUrl?: string;
  
    // --- ADDED ---
    // Each taker entry is now linked to one user
    @ManyToOne(() => User, user => user.subscriptions, { eager: true }) // eager loading simplifies fetching
    user: User;
  }

  @Entity()
    export class TradingLoginDetails {
        @PrimaryGeneratedColumn()
        id: number;
        
        @Column()
        serverName: string;
        
        @Column()
        loginID: string;
        
        @Column()
        password: string;
        
        @ManyToOne(() => User, user => user.tradingDetail, { onDelete: 'CASCADE' })
        user: User;
    }

