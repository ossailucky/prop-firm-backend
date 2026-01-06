import { IsString, IsEmail, IsNumber, IsOptional } from 'class-validator';

export class CreateSettingDto {
  @IsString() 
  appName: string;

  @IsString() 
  appDescription: string;

  @IsNumber() 
  refferalPercentage: number;

  @IsString() 
  currency: string;
  
  @IsEmail() 
  appEmail: string;

  @IsOptional()
  ETHAddress: string;
  
  @IsOptional()
 USDTAddress: string;

 @IsOptional()
 BTCAddress: string;

 @IsOptional()
 litecoinAddress: string;
  

  @IsString()
  @IsOptional()
  termsAndConditions: string;
}