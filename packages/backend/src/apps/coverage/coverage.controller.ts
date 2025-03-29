import { Controller, Post, Body } from '@nestjs/common';
import { CoverageClientDto } from './dto/coverage-client.dto';
import { CoverageClientService } from './services/coverage-client.service';

@Controller('coverage')
export class CoverageController {
  constructor(private coverageClientService: CoverageClientService) {}
  @Post('client')
  async uploadCoverageFromClient(@Body() coverageClientDto: CoverageClientDto) {
    // TODO: 实现覆盖率数据处理逻辑
    return this.coverageClientService.invoke('1', coverageClientDto);
  }
}
