import { Module } from '@nestjs/common';
import { CodeModule } from '../code/code.module';
import { CoverageModule } from '../coverage/coverage.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SnapshotController } from './snapshot.controller';
import { SnapshotService } from './snapshot.service';
import { CodeService } from 'src/code/service/code.service';
import { CoverageMapForCommitService } from 'src/coverage/services/coverage-map-for-commit.service';

@Module({
  imports: [PrismaModule],
  controllers: [SnapshotController],
  providers: [SnapshotService,CoverageMapForCommitService,CodeService],
  exports: [SnapshotService],
})
export class SnapshotModule {}
