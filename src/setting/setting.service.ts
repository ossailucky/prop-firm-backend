// setting.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  async create(dto: CreateSettingDto): Promise<Setting> {
    const setting = this.settingRepository.create(dto);
    return this.settingRepository.save(setting);
  }

  async uploadFiles(id: number, logo:string): Promise<Setting> {
    const setting = await this.settingRepository.findOne({ where: { id } });
    if (!setting) throw new NotFoundException('Setting not found');

    setting.appLogo = logo;
    
    return this.settingRepository.save(setting);
  }

  async uploadFavicon(id: number, favicon:string): Promise<Setting> {
    const setting = await this.settingRepository.findOne({ where: { id } });
    if (!setting) throw new NotFoundException('Setting not found');

    setting.appFavicon = favicon;
    
    return this.settingRepository.save(setting);
  }


  async update(id: number, dto: UpdateSettingDto) {
    const setting = await this.settingRepository.findOneBy({ id });
  
    if (!setting) throw new NotFoundException('Setting not found');
  
    // Apply fields
    Object.assign(setting, dto);
  
    return this.settingRepository.save(setting);
  }
  findAll(): Promise<Setting[]> {
    return this.settingRepository.find();
  }

  async findById(id: number): Promise<Setting> {
    try {
      const setting = await this.settingRepository.findOne({ where: { id } });
      if (!setting) {
        throw new NotFoundException('Setting not found');
      }
      return setting;
    } catch (error) {
      throw error;
    }
      
    }

  // findOne(id: string): Promise<Setting> {
  //   return this.settingRepository.findOne({ where: { id } });
  // }
}
