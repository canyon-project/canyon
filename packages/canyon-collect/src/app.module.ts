import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollectModule } from './apps/collect/collect.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [CollectModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
