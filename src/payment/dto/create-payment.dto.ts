import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity'; 

export class CreatePaymentDto {
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  // For crypto
  @IsOptional()
  @IsString()
  cryptoAddress?: string;

  // For bank
  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  accountName?: string;
}

export class CreateReferralDto {
    @IsEnum(PaymentMethod)
    method: PaymentMethod;
  
    @IsNumber()
    @IsNotEmpty()
    amount: number;
    
    // For crypto
    @IsOptional()
    @IsString()
    cryptoAddress?: string;
  
    // For bank
    @IsOptional()
    @IsString()
    bankName?: string;
  
    @IsOptional()
    @IsString()
    accountNumber?: string;
  
    @IsOptional()
    @IsString()
    accountName?: string;
  }

