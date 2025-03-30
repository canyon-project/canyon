import { Module } from '@nestjs/common';
import { ConfigResolver } from './config.resolver';
import { GetConfigsService } from './services/get-configs.service';
import { UpdateConfigService } from './services/update-config.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ConfigResolver, GetConfigsService, UpdateConfigService],
})
export class ConfigModule {}
