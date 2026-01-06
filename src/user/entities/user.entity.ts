import { Challenge, Taker } from 'src/challenge/entities/challenge.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true})
  email: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column()
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({type: Number, default: null})
  resetPasswordToken: number;
  
  @Column({type: Date, default: null})
  resetPasswordExpires: Date;

  @Column({type: String, nullable: false})
  gender: string;

  @Column({type: String, nullable: false})
  country: string;

  @Column({type: String, nullable: true,unique:true})
  referralCode: string;

@Column({type: String, nullable: true})
  referee : string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default:0})
  accountBalance: number;

 
  @OneToMany(() => Taker, (challenge) => challenge.challenge)
  subscriptions: Taker[];

//   @OneToMany(() => Deposit, (deposit) => deposit.user)
//   deposits: Deposit[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

//   @OneToMany(() => Notification, (notification) => notification.recipient)
//   notifications: Notification[];


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}