import { Module } from '@nestjs/common';
import { InfraConfigController } from './infra-config.controller';
import { InfraConfigService } from './infra-config.service';
import { OnboardingController } from './onboarding.controller';

@Module({
  imports: [],
  controllers: [InfraConfigController, OnboardingController],
  providers: [InfraConfigService],
  exports: [InfraConfigService],
})
export class InfraConfigModule {}
