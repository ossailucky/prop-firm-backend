import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, CreateReferralDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/user/entities/user.entity';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags("payments")
@Controller({version: "1", path: "payments"})
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post("create/:takerId")
  request(@Param('takerId', ParseIntPipe) takerId: number, @Req() req, @Body() dto: CreatePaymentDto) {
    return this.paymentService.requestWithdrawal(req.user.id, takerId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("referral-withdrawal")
  referral(@Req() req, @Body() dto: CreateReferralDto) {
    return this.paymentService.referralWithdrawal(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @hasRoles(UserRole.ADMIN)
  @Get()
  list(@Req() req) {
    return this.paymentService.getUserWithdrawals(req.user.id);
  }


  @UseGuards(JwtAuthGuard,RolesGuard)
  @hasRoles(UserRole.ADMIN)
  @Patch(':id/approve')
  approve(@Param('id') id: number) {
    return this.paymentService.approveWithdrawal(id);
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @hasRoles(UserRole.ADMIN)
  @Patch(':id/reject')
  reject(@Param('id') id: number) {
    return this.paymentService.rejectWithdrawal(id);
  }

  



  @UseGuards(JwtAuthGuard,RolesGuard)
  @hasRoles(UserRole.ADMIN)
  @Get("all")
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.paymentService.findOne(id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: number) {
    return this.paymentService.findByUser(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
}
