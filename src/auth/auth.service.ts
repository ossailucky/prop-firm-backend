import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthDTO, AuthorizeDTO } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async validate( authDto: AuthDTO): Promise<any>{
        try {
            const user = await this.userService.findUser(authDto);
            

            if(!user){
                throw new HttpException("Incorrect email", HttpStatus.NOT_FOUND);
            } else {
                const { password } = authDto;

                const matchPassword = await bcrypt.compare(password, user.password);
                if(!matchPassword) {
                    throw new HttpException("Incorrect password", HttpStatus.NOT_ACCEPTABLE);  
                }else{
                  
                    const token = await this.getToken({
                        id: user.id,
                        email: user.email
                    });
                    
                    
                    const data = await this.userService.findUser(authDto);  
                    
                        return {
                            data,
                            token
                        };
                }

            }

            
        } catch (error) {
            throw new HttpException(error, HttpStatus.UNAUTHORIZED);
        }
    }


    async getToken(user:AuthorizeDTO) {
        return this.jwtService.sign(user);
      }
} 
