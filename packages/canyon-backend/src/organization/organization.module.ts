import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OrganizationService } from './organization.service';
import { OrganizationResolver } from './organization.resolver';
@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [OrganizationResolver, OrganizationService],
  exports: [],
})
export class OrganizationModule {}
