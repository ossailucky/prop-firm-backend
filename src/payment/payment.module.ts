import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { Payment } from './entities/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengeModule } from 'src/challenge/challenge.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    forwardRef(() => UserModule),
    forwardRef(() => MailModule),
    forwardRef(() => ChallengeModule),
    
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
