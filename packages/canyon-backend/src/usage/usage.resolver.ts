import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PaginationArgs, SorterArgs } from '../types/input-types.args';
import { UsageModel } from './usage.model';
import { UsageService } from './usage.service';

@Resolver(() => 'Project')
export class UsageResolver {
  constructor(private readonly usageService: UsageService) {}
  @Query(() => [UsageModel], {
    description: '获取所有使用列表',
  })
  getUsages() // @Args('keyword', { type: () => String }) keyword: string,
  // @Args('bu', { type: () => [String] }) bu: string[],
  // @Args() paginationArgs: PaginationArgs,
  // @Args() sorterArgs: SorterArgs,
  : Promise<UsageModel[]> {
    return this.usageService.getUsages();
  }
}
