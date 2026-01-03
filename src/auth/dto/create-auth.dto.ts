import { IsNotEmpty,IsEmail,MinLength } from "class-validator";

export class AuthDTO {
    id: string;

    @IsEmail()
    @IsNotEmpty({message: " Email field cannot be empty"})
    email: string;

    @MinLength(8)
    @IsNotEmpty({message: "password field cannot be empty"})
    password: string;
    
    role: string;
}

export class AuthorizeDTO{
    @IsNotEmpty()
    id: number;
    @IsNotEmpty({message: " Email field cannot be empty"})
    email: string;
    
}

export class UserVerifyeDTO{
    @IsNotEmpty()
    code: number;
    
}

