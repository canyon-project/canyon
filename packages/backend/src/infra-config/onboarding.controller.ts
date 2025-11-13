import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { InfraConfigService } from './infra-config.service';

@Controller({ path: 'api/onboarding', version: '1' })
export class OnboardingController {
  constructor(private infraConfigService: InfraConfigService) {}

  @Get('status')
  async getOnboardingStatus(): Promise<any> {
    return {};
  }

  @Post('config')
  async updateOnboardingConfig(@Body() dto: any) {
    return {};
  }

  @Get('config')
  async getOnboardingConfig(@Query('token') token: string) {
    return {};
  }
}
