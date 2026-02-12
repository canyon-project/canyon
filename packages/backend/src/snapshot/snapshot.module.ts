import { Module } from '@nestjs/common';
import { CodeModule } from '../code/code.module';
import { CoverageModule } from '../coverage/coverage.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SnapshotController } from './snapshot.controller';
import { SnapshotService } from './snapshot.service';

@Module({
  imports: [PrismaModule, CodeModule, CoverageModule],
  controllers: [SnapshotController],
  providers: [SnapshotService],
  exports: [SnapshotService],
})
export class SnapshotModule {}
