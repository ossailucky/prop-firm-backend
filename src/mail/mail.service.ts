import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  // async sendEmailVerification(to: string, verificationLink: string, userName: string) {
  //   try {
  //     await this.mailerService.sendMail({
  //       to,
  //       subject: 'Email Verification',
  //       text: 'Please verify your email.',
  //       template: './email-verification',
  //       context: {
  //       userName,
  //       verificationLink,
  //       }
  //     });
  //   } catch (error) {
  //     throw new HttpException(error.message || 'Email sending failed.', HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  async verifyEmail(to: string, verificationLink: string, fullName: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Email Verification',
        text: 'Please verify your email.',
        template: './verify-email',
        context: {
        fullName,
        verificationLink,
        }
      });
    } catch (error) {
      throw new HttpException(error.message || 'Email sending failed.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async sendPasswordReset(to: string, url: string, name: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Reset Your Password',
        text: 'Click the link to reset your password.',
        template: './password-reset',
      context: {
        name,
        url,
      }
      });
    } catch (error) {
      throw new HttpException(error.message || 'Email sending failed.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async sendDepositConfirmation(
    userEmail: string,
    userName: string,
    amount: number,
    cryptoType: string,
    status: string,
  ) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: `Deposit Confirmation - ${status}`,
      template: 'deposit-confirmation',
      context: {
        userName,
        amount,
        cryptoType,
        status,
      },
    });
  }

  async sendWithdrawalConfirmation(
    userEmail: string,
    userName: string,
    amount: number,
    status: string,
    withdrawalMethod: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: `Withdrawal Confirmation - ${status}`,
        template: 'user-withdrawal',
        context: {
          userName,
          amount,
          status,
          withdrawalMethod,
          
          
        },
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send withdrawal confirmation email.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

 


  async sendAdminDepositAlert(
    userName: string,
    amount: number,
    cryptoType: string,
    status: string,   
  ) {
    await this.mailerService.sendMail({
      to: process.env.ADMIN_EMAIL, // Replace with your admin's email or a list of emails
      subject: `[ACTION REQUIRED] New Deposit Request from ${userName}`,
      template: './admin-deposit-alert',
      context: {
        userName,
        amount,
        cryptoType,
        status,
      },
    });
  }
  async sendAdminWithdrawalAlert(
    userName: string,
    amount: number,
    status: string,
   
  ) {
    await this.mailerService.sendMail({
      to: process.env.ADMIN_EMAIL, // Replace with your admin's email or a list of emails
      subject: `[ACTION REQUIRED] New Withdrawal Request from ${userName}`,
      template: './admin-withdrawal-alert',
      context: {
        userName,
        amount,
        status,
      },
    });
  }

  async sendUserDepositApproved(
    userEmail: string,
    userName: string,
    amount: number,
    cryptoType: string,
    status: string
  ) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'Your Deposit Has Been Approved!',
      template: './user-deposit-approved', // Corresponds to user-deposit-approved.hbs
      context: {
        userName,
        amount,
        cryptoType,
        status
      },
    });
    console.log(`User deposit approved email sent to ${userEmail} for ${amount} ${cryptoType}.`);
  }


  async sendUserWithdrawalApproved(
    userEmail: string,
    userName: string,
    amount: number,
    status: string,
    paymentMethod: string,
  ) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'Your Withdrawal Has Been Approved!',
      template: './user-withdrawal-approved', // Corresponds to user-withdrawal-approved.hbs
      context: {
        userName,
        amount,
        status,
        paymentMethod
      },
    });
  }

  
 
}
