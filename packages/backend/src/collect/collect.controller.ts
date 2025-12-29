import { Body, Controller, Get, Post } from '@nestjs/common';
import { CoverageClientDto } from './dto/coverage-client.dto';
import { formatCoverageData } from './helpers/formatCoverageData';
import { CoverageClientService } from './services/coverage-client.service';

// @Public()
@Controller('')
export class CollectController {
  constructor(private coverageClientService: CoverageClientService) {}
  @Post('coverage/client')
  async uploadCoverageFromClient(@Body() coverageClientDto: CoverageClientDto) {
    return this.coverageClientService.invoke('1', {
      coverage: formatCoverageData(coverageClientDto.coverage),
    });
  }
}
