import { Injectable, ConflictException, NotFoundException, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, ResetPasswordDto} from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthDTO } from 'src/auth/dto/create-auth.dto';
import crypto from "crypto";
import { log } from 'console';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
     private readonly mailService: MailService,
    // private readonly notificationService: NotificationService
  ) {}

  async create(userData: CreateUserDto): Promise<any> {
    try {
      const existingUser = await this.usersRepository.findOne({
        where: { email: userData.email },
      });
      const refCode = this.generateCode(6);


      console.log('Generated referral code:', refCode);
      
  
      if (existingUser) {
        console.log('User with this email already exists:', existingUser.email);
        
        throw new ConflictException('User with this email already exists');
      }

     
      

      const tokenSign = this.jwtService.sign(
        { email: userData.email },
      );
  
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = this.usersRepository.create({
        ...userData,
        password: hashedPassword,
        referralCode:refCode,
      });
    
      // const url = `${process.env.APP_URL}/verify-email?token=${tokenSign}`;
      // await this.mailService.verifyEmail(userData.email, url, userData.fullName);


      return this.usersRepository.save(user);
    } catch (error) {
      throw new ConflictException('Error creating user');
      
    }
    
  }

  async resendVerification(email: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: { email: email },
      });
      if (!user) throw new NotFoundException('User not found');
      if (user.isEmailVerified) return { message: 'Email is already verified.' };
    
      const token = this.jwtService.sign(
        { email: user.email }
      );
    
    
      const url = `${process.env.APP_URL}/verify-email?token=${token}`;
  
        
  
      await this.mailService.verifyEmail(user.email, url, user.fullName);
      return { message: 'Email Verification link sent to your email.' };
       
    } catch (error) {
      throw error;
    }
   
 }

 async verifyEmail(token: string) {
  try {
    const payload = this.jwtService.verify(token, { secret: process.env.JWT_EMAIL_SECRET });

    if (!payload || typeof payload.email !== 'string') {
      throw new BadRequestException('Invalid token payload.');
    }
    // Find the user by email
    const user = await this.usersRepository.findOne({
      where: { email: payload.email },
    });
    if (!user) throw new NotFoundException('User not found');

    if (user.isEmailVerified) return { message: 'Email already verified.' };

    user.isEmailVerified = true;
    await this.usersRepository.save(user);
    return { message: 'Email verified successfully.' };
  } catch (e) {
    throw new BadRequestException('Invalid or expired token');
  }
}

async forgotPassword(email: string) {
  const user = await this.usersRepository.findOne({where:{ email: email} });
  if (!user) throw new NotFoundException('User not found');

  const token = this.jwtService.sign({ email: user.email }, {
    secret: process.env.JWT_RESET_SECRET,
    expiresIn: '15m',
  });

  const resetUrl = `${process.env.APP_URL}/change-password?token=${token}`; // or frontend URL

  await this.mailService.sendPasswordReset(user.email,resetUrl,user.fullName);

  return { message: 'Password reset link sent to your email.' };
}
async resetPassword(dto: ResetPasswordDto, token:string) {
  try {
    const payload = this.jwtService.verify(token, {
      secret: process.env.JWT_RESET_SECRET,
    });

    const user = await this.usersRepository.findOne({where: { email: payload.email }});
    if (!user) throw new NotFoundException('User not found');

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepository.save(user);

    return { message: 'Password reset successfully.' };
  } catch (err) {
    throw new BadRequestException('Invalid or expired reset token.');
  }
}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByrefferalCode(code: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { referralCode:code } });
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      select: ['id', 'email', 'fullName','phoneNumber', 'role', 'isActive', 'createdAt','country', 'accountBalance', 'isEmailVerified'],});
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'fullName','phoneNumber', 'role', 'isActive','accountBalance', 'createdAt','isEmailVerified'],
      // relations: ['deposits','ownednfts', 'nfts','withdrawals','sales'],
      order: { createdAt: 'DESC' },
    });
  }

// //   async publiceUsers(): Promise<User[]> {
// //     return this.usersRepository.find({
// //       select: ['id', 'email', 'fullName', 'username','phoneNumber', 'profilePicture',  'createdAt', 'isEmailVerified'],
      
// //     });
// //   }

// //   async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
// //     return bcrypt.compare(password, hashedPassword);
// //   }

  async findUser(data: AuthDTO): Promise<any> {
    try {
      const user = await this.usersRepository.findOne({where:{email: data.email}});
    
      if(!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        
      return user;
    } catch (error) {
      throw error;
    }
  }



  async updateUser(id: number, updateData: any): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
  
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  
    const updatedUser = Object.assign(user, updateData);
    return this.usersRepository.save(updatedUser);
  }

  async updateDeactive(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
  
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  
   user.isActive = false;
    return this.usersRepository.save(user);
  }

  async updateActive(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
  
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  
   user.isActive = true;
    return this.usersRepository.save(user);
  }

// //   async addUserDeposit(userId: number, depositObject: object) {
// //     const user = await this.usersRepository.findOne({ where:{id: userId }, relations: ['deposits']});

// //     if (!user) throw new Error('User not found');

// //     user.deposits.push(depositObject as any);
// //     return await this.usersRepository.save(user);
// //   }

// //   async addUserSale(userId: number, saleObject: object) {
// //     const user = await this.usersRepository.findOne({ where:{id: userId }, relations: ['sales']});

// //     if (!user) throw new Error('User not found');

// //     user.sales.push(saleObject as any);
// //     return await this.usersRepository.save(user);
// //   }

// //   async addUserRoyalty(userId: number, nftName: string, amount: number) {
// //     try {
// //       const user = await this.usersRepository.findOne({ where:{id: userId }, relations: ['withdrawals']});

// //     if (!user) throw new Error('User not found');
// //     const royaltyObject = {
// //       nftName: nftName,
// //       amount: amount,
// //       date: new Date(),
// //     }

// //     user.royalties?.push(royaltyObject as any);
// //     return await this.usersRepository.save(user);
// //     } catch (error) {
// //       throw error;
// //     }
    
// //   }

// //   async addUserWithdraw(userId: number, withdrawObject: object) {
// //     const user = await this.usersRepository.findOne({ where:{id: userId }, relations: ['withdrawals']});

// //     if (!user) throw new Error('User not found');

// //     user.withdrawals.push(withdrawObject as any);
// //     return await this.usersRepository.save(user);
// //   }

// //   async addUserNFT(userId: number, nftObject: object) {
// //     try {
// //       const user = await this.usersRepository.findOne({ where:{id: userId }, relations: ['ownednfts']});

// //     if (!user) throw new Error('User not found');

// //     user.ownednfts.push(nftObject as any);
// //     return await this.usersRepository.save(user);
// //     } catch (error) {
// //       throw error;
      
// //     }
// //   }

// //   async removeUserNFT(userId: number, nftId: number) {
// //     try {
// //       const user = await this.usersRepository.findOne({ where:{id: userId }, relations: ['ownednfts']}); 
// //       if (!user) throw new Error('User not found');
// //       user.ownednfts = user.ownednfts.filter(nft => nft.id !== nftId);
// //       return await this.usersRepository.save(user);
// //     } catch (error) {
// //       throw error;
// //     }
    
// //   }


  async increaseUserBalance(id: number,amount:number): Promise<User> {
    try {
      
      const user = await this.usersRepository.findOne({ 
        where: { id }});
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      const newBalance = Number(user.accountBalance) + Number(amount);
      
      
      user.accountBalance = newBalance;
      
      return await this.usersRepository.save(user);
    } catch (error) {
      throw error;
    }
   
  }

  async updateReferee(id: number): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ 
        where: { id }});
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      user.referee = "";
      return await this.usersRepository.save(user);
    } catch (error) {
      throw error;
      
    }
  }

  

// //   async decreaseUserBalance(id: number,amount:number): Promise<User> {
// //     try {
// //       const user = await this.usersRepository.findOne({ 
// //         where: { id }});
// //       if (!user) {
// //         throw new NotFoundException('User not found');
// //       }
  
// //       const newBalance = Number(user.accountBalance) - Number(amount);
// //       user.accountBalance = newBalance;
// //       return await this.usersRepository.save(user);
// //     } catch (error) {
// //       throw error;
      
// //     }
    
// //   }

// //   async messageUserByEmail(id: number, dto:CreateMessageDto): Promise<any> {
// //     try {
// //       const user = await this.usersRepository.findOne({ where: { id } });
// //       if (!user) throw new NotFoundException('User not found');

// //       await this.mailService.sendAdminMessage(user.email, dto.subject,user.fullName, dto.message);
// //       return { message: 'Message sent successfully' };
// //     } catch (error) {
// //       throw new BadRequestException('Failed to send message');
// //     }
// //   }

// //   async NotifyUser(id: number, message:string): Promise<any> {
// //     try {
// //       const user = await this.usersRepository.findOne({ where: { id } });
// //       if (!user) throw new NotFoundException('User not found');

// //       await this.notificationService.createNotification({
// //          recipient:user,
// //           message:message,
// //           type:NotificationType.WITHDRAWAL_ACTIVATION,
// //         });
// //         return {message: "Notification sent Successfully"}
// //     } catch (error) {
// //       throw new BadRequestException('Failed to send noftication');
// //     }
//   }

generateCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}
}