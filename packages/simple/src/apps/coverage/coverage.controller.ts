import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CoverageClientService } from './services/coverage-client.service';
import {CoverageClientDto} from "./dto/coverage-client.dto";


@Controller('')
export class CoverageController {
  constructor(
    private coverageClientService: CoverageClientService,
  ) {}
  @Post('coverage/client')
  async uploadCoverageFromClient(@Body() coverageClientDto: CoverageClientDto) {
    return this.coverageClientService.invoke('1', coverageClientDto);
  }
}
