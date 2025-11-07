import { Body, Controller, Post } from '@nestjs/common';
import { Public } from 'src/auth/public.decorator';
import { CoverageClientDto } from './dto/coverage-client.dto';
import { formatCoverageData } from './helpers/formatCoverageData';
import { CoverageClientService } from './services/coverage-client.service';

@Public()
@Controller('')
export class CollectController {
  constructor(private coverageClientService: CoverageClientService) {}
  @Post('coverage/client')
  async uploadCoverageFromClient(@Body() coverageClientDto: CoverageClientDto) {
    return this.coverageClientService.invoke('1', {
      // @ts-expect-error
      reportID: coverageClientDto.reportID || coverageClientDto.sha,
      // @ts-expect-error
      reportProvider: coverageClientDto.reportProvider || 'person',
      ...coverageClientDto,
      coverage: formatCoverageData(coverageClientDto.coverage),
      buildTarget: coverageClientDto.buildTarget || '',
    });
  }
}
