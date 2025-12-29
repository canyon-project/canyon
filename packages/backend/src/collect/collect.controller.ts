import { Body, Controller, Get, Post } from '@nestjs/common';
import { CoverageClientDto } from './dto/coverage-client.dto';
import { CoverageMapInitDto } from './dto/coverage-map-init.dto';
import { formatCoverageData } from './helpers/formatCoverageData';
import { CoverageClientService } from './services/coverage-client.service';
import { CoverageMapInitService } from './services/coverage-map-init.service';

// @Public()
@Controller('api/coverage')
export class CollectController {
  constructor(
    private coverageClientService: CoverageClientService,
    private coverageMapInitService: CoverageMapInitService,
  ) {}
  @Post('client')
  async uploadCoverageFromClient(@Body() coverageClientDto: CoverageClientDto) {
    return this.coverageClientService.invoke('1', {
      coverage: formatCoverageData(coverageClientDto.coverage),
      scene: coverageClientDto.scene,
    });
  }

  @Post('map/init')
  async coverageMapInit(@Body() coverageMapInitDto: CoverageMapInitDto) {
    return this.coverageMapInitService.init(coverageMapInitDto);
  }
}
