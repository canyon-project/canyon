import { Body, Controller, Get, Put } from '@nestjs/common';
import { InfraConfigService } from './infra-config.service';

@Controller('api/infra-config')
export class InfraConfigController {
  constructor(private infraConfigService: InfraConfigService) {}

  @Get()
  async listAll() {
    return this.infraConfigService.listAll();
  }
}
