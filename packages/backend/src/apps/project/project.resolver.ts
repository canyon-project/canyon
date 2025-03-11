import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GetProjectsService } from './services/get-projects.service';
import { GetProjectsResponseModel } from './models/response/get-projects.response.model';
import { GetProjectsRequestModel } from './models/request/get-projects.request.model';

@Resolver(() => 'Project')
export class ProjectResolver {
  constructor(private readonly getProjectsService: GetProjectsService) {}
  @Query(() => GetProjectsResponseModel, {
    description: '获取Project',
  })
  getProjects(
    @Args() args: GetProjectsRequestModel,
  ): Promise<GetProjectsResponseModel> {
    return this.getProjectsService.invoke(args.current, args.pageSize);
  }
}
