import { Injectable } from '@nestjs/common';
import { logger } from '../../logger';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaSqliteService } from '../../prisma/prisma-sqlite.service';
import { CoverageClientDto } from '../dto/coverage-client.dto';
import { checkCoverageType } from '../helpers/checkCoverageType';
import { generateSecureId } from '../helpers/coverageID';
import { generateObjectSignature } from '../helpers/generateObjectSignature';
import { separateCoverage } from '../helpers/separateCoverage';
import { encodeObjectToCompressedBuffer } from '../helpers/transform';

type CoverageKind = 'hit' | 'map';
type HitCounters = Record<string, number>;
interface HitFileCoverageEntry {
  s?: HitCounters;
  f?: HitCounters;
  b?: unknown;
  inputSourceMap?: number;
}
type HitCoverage = Record<string, HitFileCoverageEntry>;

interface MapFileCoverageEntry {
  statementMap: unknown;
  fnMap: unknown;
  branchMap: unknown;
  inputSourceMap?: unknown;
  contentHash?: string;
  oldPath?: string; // 如果有 oldPath，说明这是 remap 后的数据
}
type MapCoverage = Record<string, MapFileCoverageEntry>;

interface InsertHitParams {
  coverage: HitCoverage;
  coverageID: string;
  versionID: string;
  instrumentCwd: string;
  reportID?: string;
  reportProvider?: string;
}

interface InsertMapParams {
  coverage: MapCoverage;
  coverageID: string;
  versionID: string;
  instrumentCwd: string;
}

@Injectable()
export class CoverageClientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaSqlite: PrismaSqliteService,
  ) {}

  async invoke(reporter: string, coverageClientDto: CoverageClientDto) {
    const { coverage } = coverageClientDto;
    return {};
  }
}
