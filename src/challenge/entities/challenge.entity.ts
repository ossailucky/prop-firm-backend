import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
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
      
  @Column()
  oneTimeFee?: string;
  
  @Column()
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

    @Column({default: 'pending'})
    status: string;

    @Column()
    paymentMedium: string;

    @Column({ nullable: true })
    receiptUrl?: string;
  
    // --- ADDED ---
    // Each taker entry is now linked to one user
    @ManyToOne(() => User, user => user.subscriptions, { eager: true }) // eager loading simplifies fetching
    user: User;
  }

