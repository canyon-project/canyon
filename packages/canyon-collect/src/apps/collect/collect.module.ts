import { Module } from '@nestjs/common';
import { CollectController } from './collect.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { CoverageClientService } from './services/coverage-client.service';
import { CoverageMapClientService } from './services/coverage-map-client.service';
// import {AppController} from "../../app.controller";
// import {AppService} from "../../app.service";

@Module({
  imports: [PrismaModule],
  controllers: [CollectController],
  providers: [CoverageClientService, CoverageMapClientService],
})
export class CollectModule {}
