import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import 'dotenv/config';
import { join } from 'path';


@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', // Gmail SMTP server
        port: 465,              // SSL port
        secure: true,           // True for port 465
        auth: {
          user: process.env.GMAIL_USER, // Your Gmail address (e.g., example@gmail.com)
          pass: process.env.GMAIL_PASS, // App password or Gmail password
        },
      },
      defaults: {
        from: 'Funded Up <fundedup.net>', // Replace with your Gmail address
      },
      template: {
        dir: join(__dirname, '..', '..', 'mail-templates'), // Path to your email templates
        adapter: new HandlebarsAdapter(), // Use Handlebars adapter
        options: {
          strict: true, // Throws if a variable is not found in the context
        },
      },
    }),
  ],
  providers: [MailService,MailModule],
  exports: [MailService],
})
export class MailModule {}
