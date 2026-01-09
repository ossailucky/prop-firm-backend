import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, ParseIntPipe, Req, UploadedFile, Query } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { CreateChallengeDto, RequestReviewDto, TradingLoginDetailsDTO } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/entities/user.entity';
import { log } from 'console';
import { Status } from './entities/challenge.entity';

@ApiTags("challenge")
@Controller({version: "1", path: "challenge"})
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Post("create")
  create(@Body() createChallengeDto: CreateChallengeDto) {
    return this.challengeService.create(createChallengeDto);
  }

  @Get()
  findAll() {
    return this.challengeService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/take-challenge')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/challenge/payments', // folder to save images
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    }),
  )
  takeChallenge(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Req() req, // Use the request object to get the user
    @UploadedFile() file: Express.Multer.File,
  ) {
    
    const userId = req.user.id; // Get user ID from the token payload
    const imageUrl = file?.filename ? `uploads/challenge/payments/${file.filename}` : null;
    const paymentMedium = body.paymentMedium;
    
    return this.challengeService.addTaker(id, userId,paymentMedium,imageUrl);
  }

  @UseGuards(JwtAuthGuard)
  //@hasRoles(UserRole.ADMIN)
  @Patch('/approve/:takerId')
  approveChallenge(@Param('takerId', ParseIntPipe) takerId: number) {
    return this.challengeService.approveChallenge(takerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/active')
  getActiveChallenge(@Req() req) {
    return this.challengeService.findOneTakerByStatus(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/complete')
  getCompleteChallenge(@Req() req) {
    return this.challengeService.findOneCompletedTaker(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/request-review/:takerId')
  requestReviewChallenge(@Param('takerId', ParseIntPipe) takerId: number, @Req() req, @Body() requestReviewDto: RequestReviewDto)  {
    return this.challengeService.requestReview(takerId, req.user.id, requestReviewDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/send-login-details/:takerId')
  sendLoginDetails(@Param('takerId', ParseIntPipe) takerId: number, @Body() detailsDto: TradingLoginDetailsDTO)  {
    
    return this.challengeService.sendTradingLoginByEmail(takerId, detailsDto);
  }

  @UseGuards(JwtAuthGuard)
  @hasRoles(UserRole.ADMIN)
  @Patch('/confirm-phase/:takerId')
  confirmChallengePhase(@Param('takerId', ParseIntPipe) takerId: number) {
    return this.challengeService.confirmPhase(takerId);
  }

  @UseGuards(JwtAuthGuard)
  @hasRoles(UserRole.ADMIN)
  @Patch('/reject-phase/:takerId')
  failChallengePhase(@Param('takerId', ParseIntPipe) takerId: number) {
    return this.challengeService.failPhaseConfirm(takerId);
  }



  @UseGuards(JwtAuthGuard)
  @Get("/trading-account")
  findOne(@Req() req,) {
    return this.challengeService.getTradingDetails(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("/challenge-by-status")
  challengeByStatus(@Query('status') status: Status) {
    return this.challengeService.findTakersByStatus(status);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateChallengeDto: UpdateChallengeDto) {
  //   return this.challengeService.update(+id, updateChallengeDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.challengeService.remove(+id);
  // }
}
