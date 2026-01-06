import { Module } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import 'dotenv/config';
import { User } from './user/entities/user.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MailModule } from './mail/mail.module';
import { ChallengeModule } from './challenge/challenge.module';
import { PaymentModule } from './payment/payment.module';
import { Challenge, Taker } from './challenge/entities/challenge.entity';
import { SettingModule } from './setting/setting.module';
import { Payment } from './payment/entities/payment.entity';
import { Setting } from './setting/entities/setting.entity';



Handlebars.registerHelper('toLowerCase', function (str) {
  if (typeof str === 'string') {
    return str.toLowerCase();
  }
  return str; // Return original if not a string
});


@Module({
  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true,
    // }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [ User, Challenge, Taker, Payment, Setting ],
      synchronize: true, // Set to false in production
      logging: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

  AuthModule,
    UserModule,
    MailModule,
    ChallengeModule,
    PaymentModule,
    SettingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}