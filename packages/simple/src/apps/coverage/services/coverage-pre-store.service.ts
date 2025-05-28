import { HttpException, Injectable } from '@nestjs/common';
// import { PrismaService } from "src/prisma/prisma.service";
import { CoverageSummaryDataMap } from 'canyon-data';
import { decompressedData } from 'canyon-map';

import { CoverageSummaryDto } from '../dto/coverage-summary.dto';
// import { CoverageMapDto } from "../dto/coverage-map.dto";
// import { CoverageMapData } from "istanbul-lib-coverage";
// import { CoverageFinalService } from "./common/coverage-final.service";
import { InjectRepository } from '@nestjs/typeorm';
import { SimpleCoverage } from '../entities/simple-coverage.entity';
import { Repository } from 'typeorm';
import { CoverageMapData } from 'istanbul-lib-coverage';
import { CoverageMapDto } from '../dto/coverage-map.dto';

/**
 * Service to handle pre-storage operations for code coverage data.
 * This service provides methods for retrieving and processing coverage summary and coverage map data.
 *
 * It interacts with the Prisma service to fetch coverage-related data from the database, decompresses the
 * data, processes it, and formats it before returning the results.
 *
 * Methods:
 * - coverageSummaryMap: Retrieves and decompresses the coverage summary for a specific project and report.
 * - coverageMap: Retrieves, processes, and reorganizes coverage map data for a specific project and report.
 *
 * Dependencies:
 * - PrismaService: Provides access to the database to retrieve coverage and coverage map data.
 * - canyon-data: Utilities for resetting, reorganizing, and manipulating coverage data.
 * - canyon-map: Utility to remap coverage data based on the instrumented current working directory.
 */
@Injectable()
export class CoveragePreStoreService {
  constructor(
    @InjectRepository(SimpleCoverage)
    private usersRepository: Repository<SimpleCoverage>,
  ) {}

  /**
   * Retrieves the coverage summary map for a specific project, commit (SHA), and report ID.
   *
   * @param {CoverageSummaryDto} dto - The data transfer object containing project ID, SHA, and report ID.
   * @returns {Promise<CoverageSummaryDataMap>} - A promise that resolves to the decompressed coverage summary map.
   * @throws {HttpException} - If the coverage summary data is not found, an exception with status 404 is thrown.
   */
  async coverageSummaryMap({
    repoID,
    sha,
    reportID,
  }: CoverageSummaryDto): Promise<CoverageSummaryDataMap> {
    const coverage: any = await this.usersRepository.findOne({
      where: {
        sha,
        repo_id: repoID,
        // repoID,
        // reportID: reportID,
        // covType: reportID ? 'agg' : 'all',
      },
    });

    if (coverage?.summary) {
      return decompressedData<CoverageSummaryDataMap>(coverage.summary);
    }
    // 不报错，直接返回空对象
    return {};
  }

  /**
   * Retrieves and processes the coverage map data for a specific project, commit (SHA), report ID, and file path.
   *
   * @param {CoverageMapDto} dto - The data transfer object containing project ID, SHA, report ID, and file path.
   * @returns {Promise<CoverageMapData>} - A promise that resolves to the processed and reorganized coverage map data.
   */
  async coverageMap({
    repoID,
    sha,
    reportID,
    filepath,
  }: CoverageMapDto): Promise<CoverageMapData> {
    const coverage: any = await this.usersRepository.findOne({
      where: {
        sha,
        repo_id: repoID,
        // repoID,
        // reportID: reportID,
        // covType: reportID ? 'agg' : 'all',
      },
    });
    if (coverage?.hit) {
      return decompressedData<CoverageMapData>(coverage.hit).then((r) => {
        return {
          [filepath]: r[filepath],
        };
      });
    }
    // 不报错，直接返回空对象
    return {};
  }
}
