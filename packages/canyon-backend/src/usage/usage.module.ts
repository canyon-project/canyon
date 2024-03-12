import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsageService } from './usage.service';
import { UsageResolver } from './usage.resolver';
@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [UsageResolver, UsageService],
  exports: [],
})
export class UsageModule {}
