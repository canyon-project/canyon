import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PaginationArgs, SorterArgs } from '../types/input-types.args';
import { OrganizationModel } from './organization.model';
import { OrganizationService } from './organization.service';

@Resolver(() => 'Project')
export class OrganizationResolver {
  constructor(private readonly organizationService: OrganizationService) {}
  @Query(() => OrganizationModel, {
    description: '获取所有组织列表',
  })
  getOrganizations() // @Args('keyword', { type: () => String }) keyword: string,
  // @Args('bu', { type: () => [String] }) bu: string[],
  // @Args() paginationArgs: PaginationArgs,
  // @Args() sorterArgs: SorterArgs,
  : Promise<OrganizationModel> {
    return this.organizationService.getOrganizations();
  }
}
