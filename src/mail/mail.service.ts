import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { log } from 'console';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmailVerification(to: string, verificationLink: string, userName: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Email Verification',
        text: 'Please verify your email.',
        template: './email-verification',
        context: {
        userName,
        verificationLink,
        }
      });
    } catch (error) {
      throw new HttpException(error.message || 'Email sending failed.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

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

  async sendStakeEmail(
    stakerEmail: string,
    stakerName: string,
    amount: number,
  ) {
    await this.mailerService.sendMail({
      to: stakerEmail,
      subject: `Your Challenge for "${amount}" has been submitted!`,
      template: './challenge-alert',
      context: {
        stakerName,
        amount,
      },
    });
    console.log(`Challenge confirmation submitted${stakerEmail}.`);
  }

  async sendStakeEmailAdmin(
    stakerName: string,
    amount: number,
  ) {
    await this.mailerService.sendMail({
      to: process.env.ADMIN_EMAIL,
      subject: `A Challenge for "${amount}" has been submitted!`,
      template: './challenge-alert-admin',
      context: {
        stakerName,
        amount,
      },
    });
    console.log(`Challenge confirmation submitted${process.env.ADMIN_EMAIL} .`);
  }

  async sendReviewRequestAdmin(
    username: string,
    amount: number,
    phase: number
  ) {
    await this.mailerService.sendMail({
      to: process.env.ADMIN_EMAIL,
      subject: `A Challenge review for "${amount}" has been requested!`,
      template: './review-alert',
      context: {
        username,
        amount,
        phase,
      },
    });
    console.log(`Challenge review request submitted${process.env.ADMIN_EMAIL} .`);
  }

  async challengeCompleted(
    userEmail: string,
    username: string,
    amount: number,
    phase: number,
    profit: number,
    status: string,
  ) {
    const supportEmail = process.env.ADMIN_EMAIL;
    await this.mailerService.sendMail({
      to: userEmail,
      subject: `A Challenge review for "${amount}" has been requested!`,
      template: './review-alert',
      context: {
        username,
        amount,
        phase,
        profit,
        status,
        supportEmail

      },
    });
    console.log(`Challenge review request submitted${process.env.ADMIN_EMAIL} .`);
  }

  

  async tradingDetailsMessage(userEmail: string, firstName:string, accountId: string, password: string, serverName: string) {
   const supportEmail = process.env.ADMIN_EMAIL;
   
    await this.mailerService.sendMail({
      to: userEmail,
      subject: `Trading Account Creditial`,
      template: './send-trading-acct',
      context: {
        firstName,
        accountId,
        password,
        serverName,
        supportEmail
      },
    });
  }

  async confirmChallengePhase(userEmail: string, username:string, messageContent: string) {
    
     await this.mailerService.sendMail({
       to: userEmail,
       subject: `Review Result Confirmation`,
       template: './review-confirm',
       context: {
         username,
         messageContent,
       },
     });
   }

  async sendRefferralBonus(userEmail: string, userName:string, getterName: string, amount: number) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: `Refferal Bonus`,
      template: './refferal-bonus',
      context: {
        userName,
        getterName,
        amount,
      },
    });
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
