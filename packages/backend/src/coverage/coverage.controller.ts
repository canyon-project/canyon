import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { MapQueryDto } from './dto/map.dto';
import { CoverageMapForCommitService } from './services/coverage-map-for-commit.service';

@Controller('api/coverage')
export class CoverageController {
  constructor(
    private readonly coverageMapForCommitService: CoverageMapForCommitService,
  ) {}

  @Get('map')
  async getMap(@Query() q: MapQueryDto) {
    return this.coverageMapForCommitService.invoke(q);
  }
}
