import { IsEmail, IsEnum, IsOptional, IsString, Length, Matches, MinLength } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email: string;

//   @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).+/, {
//     message:
//       'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.',
//   })
  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  fullName: string;

  @IsString()
  phoneNumber: string;


  @IsString()
  country: string;

  @IsString()
  gender: string;

    @IsOptional()
    @IsString()
    referee : string;

}

export class ResetPasswordDto {
    @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).+/, {
     message:
       'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.',
   })
 @IsString()
 @MinLength(6)
 newPassword: string;
}

export class ForgotPasswordDto {
    @IsEmail()
    email: string;
  }


  export class CreateMessageDto {
    @IsString()
    subject: string;
  
    @IsString()
    @Length(5, 500)
    message: string; 
  }

