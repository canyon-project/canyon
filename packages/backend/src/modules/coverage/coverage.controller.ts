import { Controller, Get, Query } from '@nestjs/common';
import { CoverageService } from './coverage.service';
import { SummaryMapQueryDto } from './dto/summary-map.dto';
import { MapQueryDto } from './dto/map.dto';

@Controller('coverage')
export class CoverageController {
  constructor(private readonly coverage: CoverageService) {}

  @Get('overview')
  async getOverview(
    @Query('subject') subject: string,
    @Query('subjectID') subjectID: string,
    @Query('provider') provider: string,
    @Query('repoID') repoID: string
  ) {
    return this.coverage.getOverview({ subject, subjectID, provider, repoID });
  }

  @Get('summary/map')
  async getSummaryMap(@Query() q: SummaryMapQueryDto) {
    return this.coverage.getSummaryMap(q);
  }

  // 测试：{{url}}/api/coverage/map?provider=gitlab&subjectID=5fc91cca2ed37f3ca406cb38bef8a07d9684e430&repoID=86927&filePath=src/components/B0.tsx&subject=commit
  @Get('map')
  async getMap(@Query() q: MapQueryDto) {
    console.log(q)
    return this.coverage.getMap(q);
  }
}


