import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, Length, Matches, MinLength } from "class-validator";


export class CreateChallengeDto {
    @IsNumber()
    amount: number;
    
    @IsNumber()
    profitTarget: number;

    @IsNumber()
    dailyLossLimit: number;

    @IsNumber()
    maxDrawdown: number;

    @IsNumber()
    fee: number;
    
    @IsNumber()
    @IsOptional()
    phaseOne?: number;

    @IsNumber()
    @IsOptional()
    phaseTwo?: number;

    @IsNumber()
    @IsOptional()
    phaseThree?: number;
    
    @IsString()
    @IsOptional()
    oneTimeFee?: string;

    @IsString()
    @IsOptional()
    minBenchmark?: string;
}

export class RequestReviewDto {

    @IsNumber()
    phase: number;
}
