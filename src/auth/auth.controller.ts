import { Body, Controller, Get, Patch, Post, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthDTO, UserVerifyeDTO } from './dto/create-auth.dto';
import { Response } from 'express';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

ApiTags("auth")
@Controller({version: "1", path: "auth"})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post("login")
  async login(@Res() res: Response, @Body() authDto: AuthDTO){
    const { data, token } = await this.authService.validate(authDto);

    res.setHeader('Authorization', `Bearer ${token}`);
    res.json({data, token});
    
  }

  @Post("register")
  async register(@Res() res: Response, @Body() userDto: CreateUserDto){
    const data = await this.userService.create(userDto);
    const token = await this.authService.getToken({
      id:data.id,
      email:data.email
    })
    res.setHeader('Authorization', `Bearer ${token}`);
    res.json({data, token});
  }

  // @Patch('verify-email')
  // async verify(@Query('token') token: string) {
  //   return this.userService.verifyEmail(token);
  // }

}
