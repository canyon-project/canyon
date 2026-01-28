import { Global, Module } from '@nestjs/common/decorators';
import { PrismaService } from './prisma.service';
import { PrismaSqliteService } from './prisma-sqlite.service';

@Global()
@Module({
  providers: [PrismaService, PrismaSqliteService],
  exports: [PrismaService, PrismaSqliteService],
})
export class PrismaModule {}
