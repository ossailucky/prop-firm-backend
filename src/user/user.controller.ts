import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe, UseInterceptors, UploadedFile, Req, ParseFloatPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateMessageDto, CreateUserDto, ForgotPasswordDto, ResetPasswordDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { ApiTags } from '@nestjs/swagger';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

ApiTags("user")
@Controller({version: "1", path: "user"})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("register")
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('resend-verification')
  resendVerification(@Body('email') email: string) {
  return this.userService.resendVerification(email);
}

  // @Post('forgot-password')
  // forgotPassword(@Body('email') email: string) {
  //   return this.userService.forgotPassword(email);
  // }

  // @Post('reset-password')
  // resetPassword(@Query('token') token: string, @Body() dto: ResetPasswordDto) {
  //   return this.userService.resetPassword(dto,token);
  // }
  // @UseGuards(JwtAuthGuard)
  // @hasRoles(UserRole.ADMIN)
  // @Get()
  // findAll() {
  //   return this.userService.findAll();
  // }

  // @Get("users")
  // AllInPublic() {
  //   return this.userService.publiceUsers();
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get("profile")
  // getUser(@Req() req: any) {
  //   return this.userService.findById(req.user.id);
  // }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @hasRoles(UserRole.ADMIN)
  // @Get(":id")
  // findUser(@Param('id', ParseIntPipe) id: number,) {
  //   return this.userService.findById(id);
  // }

 

  
  // @UseGuards(JwtAuthGuard)
  // @Patch()
  // async update(
  //   @Req() req: any,
  //   @Body() updateUserDto: any,
  // ) {
  //   return this.userService.updateUser(req.user.id, updateUserDto);
  // }

  // @Post(':id/message')
  // async message(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() messageDto: CreateMessageDto,
  // ) {
  //   return this.userService.messageUserByEmail(id, messageDto);
  // }

  // @Post(':id/notify')
  // async notify(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() messageDto: any,
  // ) {
  //   return this.userService.NotifyUser(id, messageDto.message);
  // }

  // @Patch(':id/update')
  // async updateRole(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() messageDto: any,
  // ) {
  //   return this.userService.updateUser(id, messageDto);
  // }

  // @Patch(':id/active-false')
  // async updateDeactive(
  //   @Param('id', ParseIntPipe) id: number,
  // ) {
  //   return this.userService.updateDeactive(id);
  // }

  // @Patch(':id/active')
  // async updateActive(
  //   @Param('id', ParseIntPipe) id: number,
  // ) {
  //   return this.userService.updateActive(id);
  // }



  

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
