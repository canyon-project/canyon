import { Global, Module } from '@nestjs/common/decorators';
import { PrismaService } from './prisma.service';
import { PrismaService2 } from './prisma-sqlite.service';

@Global()
@Module({
  providers: [PrismaService, PrismaService2],
  exports: [PrismaService, PrismaService2],
})
export class PrismaModule {}
