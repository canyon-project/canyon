import { Module } from '@nestjs/common';
import { GitHubAdapter } from './adapters/github.adapter';
import { GitLabAdapter } from './adapters/gitlab.adapter';
import { ProviderController } from './provider.controller';
import { ProviderService } from './provider.service';

@Module({
  controllers: [ProviderController],
  providers: [ProviderService, GitLabAdapter, GitHubAdapter],
  exports: [ProviderService],
})
export class ProviderModule {}
