import { Body, Controller, Get, Put } from '@nestjs/common';
// import { ThrottlerBehindProxyGuard } from 'src/guards/throttler-behind-proxy.guard';
import { InfraConfigService } from './infra-config.service';
// import {InfraConfigEnum} from "../types/InfraConfig";
// import * as E from 'fp-ts/Either';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { RESTAdminGuard } from 'src/admin/guards/rest-admin.guard';
// import { RESTError } from 'src/types/RESTError';
// import { InfraConfigEnum } from 'src/types/InfraConfig';
// import { throwHTTPErr } from 'src/utils';

// @UseGuards(ThrottlerBehindProxyGuard)
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
