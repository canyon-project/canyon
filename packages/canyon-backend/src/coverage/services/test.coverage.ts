import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoverageDataAdapterService } from './coverage-data-adapter.service';
import { PullChangeCodeAndInsertDbService } from './pull-change-code-and-insert-db.service';
import { CoveragediskService } from './coveragedisk.service';
import {
  genSummaryMapByCoverageMap,
  getSummaryByPath,
  mergeCoverageMap,
} from '@canyon/data';

@Injectable()
export class TestCoverage {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coverageDataAdapterService: CoverageDataAdapterService,
    private readonly pullChangeCodeAndInsertDbService: PullChangeCodeAndInsertDbService,
    private readonly coveragediskService: CoveragediskService,
  ) {}

  async invoke() {
    const coverages = await this.prisma.coverage.findMany({
      where: {
        sha: 'b61375c962499fe448a7985b22c9c7f6b1f023ea',
        covType: 'agg',
      },
    });
    let cov = {};
    for (let i = 0; i < coverages.length; i++) {
      console.log(i);
      const c = await this.coverageDataAdapterService.retrieve(
        coverages[i].relationID,
      );
      cov = mergeCoverageMap(cov, c);
      console.log(
        coverages[i].reportID,
        getSummaryByPath('~', genSummaryMapByCoverageMap(c, []))['statements'][
          'pct'
        ],
      );
    }
    console.log(
      getSummaryByPath('~', genSummaryMapByCoverageMap(cov, []))['statements'][
        'pct'
      ],
    );
  }
}
