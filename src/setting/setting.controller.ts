// setting.controller.ts
import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  UploadedFile,
} from '@nestjs/common';
import { SettingService } from './setting.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { ApiTags } from '@nestjs/swagger';
import { FilesInterceptor , FileFieldsInterceptor, FileInterceptor} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/entities/user.entity';

ApiTags('settings')
@Controller({ version: '1', path: 'settings' })
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Post()
  create(@Body() dto: CreateSettingDto) {
    return this.settingService.create(dto);
  }

  // @UseGuards(JwtAuthGuard,RolesGuard)
  // @hasRoles(UserRole.ADMIN)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor(
      'appLogo', {
      storage: diskStorage({
        destination: './uploads/app',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadLogo(
    @Param('id') id: number,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const logoUrl = file?.filename && `uploads/app/${file.filename}`;
   
    return this.settingService.uploadFiles(id, logoUrl);
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @hasRoles(UserRole.ADMIN)
  @Patch(':id/icon')
  @UseInterceptors(
    FileInterceptor(
      'appFavicon', {
      storage: diskStorage({
        destination: './uploads/app',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadFavicon(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const faviconUrl = file?.filename && `uploads/app/${file.filename}`;
   
    return this.settingService.uploadFavicon(id, faviconUrl);
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @hasRoles(UserRole.ADMIN)
  @Patch(':id/update')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateSettingDto,
  ) {
    return await this.settingService.update(id, dto);
  }
  
  @UseGuards(JwtAuthGuard,RolesGuard)
  @hasRoles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.settingService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    return await this.settingService.findById(id);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.settingService.findOne(id);
  // }
}
