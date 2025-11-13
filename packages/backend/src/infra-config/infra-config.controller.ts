import { Body, Controller, Get, Put } from '@nestjs/common';
import { InfraConfigService } from './infra-config.service';

@Controller('api/infra-config')
export class InfraConfigController {
  constructor(private infraConfigService: InfraConfigService) {}

  @Get()
  async listAll() {
    return this.infraConfigService.listAll();
  }

  @Put()
  async updateMany(
    @Body()
    body: {
      items: Array<{ name: string; value: string; isEncrypted?: boolean }>;
    },
  ) {
    const items = Array.isArray(body?.items) ? body.items : [];
    return this.infraConfigService.upsertMany(items);
  }
}
