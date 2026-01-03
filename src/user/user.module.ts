import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.EMAIL_SECRET || 'supersecretkey',
      signOptions: { expiresIn: "1h"},
    }),
    // forwardRef(() => MailModule),
    // forwardRef(() => NftModule),
    // forwardRef(() => NotificationModule),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}