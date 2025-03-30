import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GetConfigsService } from './services/get-configs.service';
import { UpdateConfigService } from './services/update-config.service';
import { ConfigRecord } from './models/config-records.model';
import { UpdateConfigInput } from './models/request/update-config.input';

@Resolver(() => ConfigRecord)
export class ConfigResolver {
  constructor(
    private readonly getConfigsService: GetConfigsService,
    private readonly updateConfigService: UpdateConfigService,
  ) {}

  @Query(() => [ConfigRecord])
  async configs() {
    return this.getConfigsService.execute();
  }

  @Mutation(() => ConfigRecord)
  async updateConfig(@Args('input') input: UpdateConfigInput) {
    return this.updateConfigService.execute(input);
  }
}
