import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CoverageAnalysisQueryParamsTypes,
  CoverageQueryParamsTypes,
} from '../types/coverage-query-params.types';

@Injectable()
export class CoverageMapForAnalysisService {
  constructor(private readonly prisma: PrismaService) {}

  async invoke({
    provider,
    repoID,
    analysisID,
    buildTarget,
    filePath,
    scene,
  }: CoverageAnalysisQueryParamsTypes) {
    return {
      name: 'zt',
    };
  }
}
