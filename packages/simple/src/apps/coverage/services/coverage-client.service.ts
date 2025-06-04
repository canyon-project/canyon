import { Inject, Injectable } from '@nestjs/common';
import { CoverageClientDto } from '../dto/coverage-client.dto';
import { SimpleCoverage } from '../entities/simple-coverage.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { genSummaryMapByCoverageMap, getSummaryByPath } from 'canyon-data';
import {
  compressedData,
  remapCoverageByOld,
  // remapCoverageWithInstrumentCwd,
} from 'canyon-map';
import { remapCoverageWithInstrumentCwd } from '../../coverage';
// 核心逻辑，需要用buildID获取所有关联的map，而不是单纯的通过coverageId获取到的
@Injectable()
export class CoverageClientService {
  constructor(
    @InjectRepository(SimpleCoverage)
    private usersRepository: Repository<SimpleCoverage>,
  ) {}
  async invoke(
    reporter: string,
    {
      provider,
      sha,
      repoID,
      coverage,
      instrumentCwd,
      reportID, // Option
      branch, // Option
      compareTarget, // Option
      buildID, // Option
      buildProvider, // Option
      reportProvider, // Option
    }: CoverageClientDto,
  ) {
    const reMapedCov = await remapCoverageWithInstrumentCwd(
      coverage,
      instrumentCwd,
    );

    const summary = genSummaryMapByCoverageMap(reMapedCov, []);
    const sum: any = getSummaryByPath('', summary);
    const summaryZstd: any = await compressedData(summary);
    const hitZstd: any = await compressedData(reMapedCov);

    return this.usersRepository
      .insert({
        id: sha,
        sha,
        branch,
        provider,
        repo_id: repoID,
        build_provider: buildProvider,
        build_id: buildID,
        branches_total: sum.branches.total,
        branches_covered: sum.branches.covered,
        functions_total: sum.functions.total,
        functions_covered: sum.functions.covered,
        lines_total: sum.lines.total,
        lines_covered: sum.lines.covered,
        statements_total: sum.statements.total,
        statements_covered: sum.statements.covered,
        newlines_total: sum.newlines.total,
        newlines_covered: sum.newlines.covered,
        summary: summaryZstd,
        hit: hitZstd,
        instrument_cwd: instrumentCwd,
      })
      .catch((e) => {
        console.log(e);
        return {
          msg: '有了',
        };
      });
  }
}
