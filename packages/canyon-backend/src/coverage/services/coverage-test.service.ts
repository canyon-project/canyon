import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoverageTest } from '../schemas/coverage-test.schema';
import { decompressedData } from '../../utils/zstd';
import { PrismaService } from '../../prisma/prisma.service';
import { CoverageDataAdapterService } from './common/coverage-data-adapter.service';
import { percent } from '../../utils/utils';
const emptySummary = {
  functions: {
    covered: 0,
    total: 0,
    skipped: 0,
    pct: 0,
  },
  statements: {
    covered: 0,
    total: 0,
    skipped: 0,
    pct: 0,
  },
  branches: {
    covered: 0,
    total: 0,
    skipped: 0,
    pct: 0,
  },
  lines: {
    covered: 0,
    total: 0,
    skipped: 0,
    pct: 0,
  },
  newlines: {
    covered: 0,
    total: 0,
    skipped: 0,
    pct: 0,
  },
};

@Injectable()
export class CoverageTestService {
  constructor(
    @InjectModel(CoverageTest.name)
    private coverageTestModel: Model<CoverageTest>,

    private readonly coverageDataAdapterService: CoverageDataAdapterService,
    private readonly prisma: PrismaService,
  ) {}
  async create({ projectID, sha, coverage, branch }) {
    const c = await this.prisma.coverage.create({
      data: {
        sha,
        projectID,
        branch,
        summary: this.cptSum(coverage),
        instrumentCwd: '',
        key: '',
        tag: [],
        compareTarget: sha,
        reportID: sha,
        relationID: '',
        provider: 'tripgl',
        reporter: '',
        covType: 'agg',
      },
    });

    const coverageData = await this.coverageDataAdapterService.create(
      coverage,
      c.id,
    );

    await this.prisma.coverage.update({
      where: {
        id: c.id,
      },
      data: {
        relationID: coverageData,
      },
    });

    // 这里插入agg和all，外面数据就能看到了。然后还缺一个详情页，根据project的language分jacoco和istanbul
    // 优先做cli，给dll
    return 'ok';
    // return this.coverageTestModel.create({ projectID, sha, coverage });
  }

  find({ projectID, sha }) {
    return this.coverageTestModel
      .findOne({ projectID, sha })
      .then((r) => {
        return decompressedData(r.coverage);
      })
      .then((r) => JSON.parse(r));
  }

  cptSum(coverage) {
    const { covered, missed } = coverage.report.counter.find(
      ({ type }) => type === 'INSTRUCTION',
    );
    return {
      ...emptySummary,
      statements: {
        pct: percent(covered, covered + missed),
        total: covered + missed,
        covered: covered,
        skipped: 0,
      },
    };
  }
}
