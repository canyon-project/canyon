import { Module } from '@nestjs/common';
import { SiteController } from './infra-config.controller';
import { InfraConfigService } from './infra-config.service';
// import { InfraConfigResolver } from './infra-config.resolver';
// import { UserModule } from 'src/user/user.module';
import { OnboardingController } from './onboarding.controller';

@Module({
  imports: [],
  controllers: [SiteController, OnboardingController],
  providers: [InfraConfigService],
  exports: [InfraConfigService],
})
export class InfraConfigModule {}
