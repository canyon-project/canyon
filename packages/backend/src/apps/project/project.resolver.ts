import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GetProjectsService } from './services/get-projects.service';
import { GetProjectsResponseModel } from './models/response/get-projects.response.model';
import { GetProjectsRequestModel } from './models/request/get-projects.request.model';
import { GetProjectCommitsRequestModel } from './models/request/get-project-commits.request.model';
import { GetProjectCommitCoverageRequestModel } from './models/request/get-project-commit-coverage.request.model';
import { GetProjectCommitsResponseModel } from './models/response/get-project-commits.response.model';
import { GetProjectCommitCoverageResponseModel } from './models/response/get-project-commit-coverage.response.model';
import { GetProjectCommitsService } from './services/get-project-commits.service';
import { GetProjectCommitCoverageService } from './services/get-project-commit-coverage.service';
import {GqlAuthGuard} from "../../guards/gql-auth.guard";
import {GqlUser} from "../../decorators/gql-user.decorator";
import {UserModel} from "../user/models/user.model";
import {PaginationArgs, SorterArgs} from "../../types/input-types.args";

@Resolver(() => 'Project')
export class ProjectResolver {
  constructor(
    private readonly getProjectsService: GetProjectsService,
    private readonly getProjectCommitsService: GetProjectCommitsService,
    private readonly getProjectCommitCoverageService: GetProjectCommitCoverageService,
  ) {}



  @UseGuards(GqlAuthGuard)
  @Query(() => GetProjectsResponseModel, {
    description: "获取Project",
  })
  getProjects(
    @GqlUser() user: UserModel,
    @Args("keyword", { type: () => String }) keyword: string,
    @Args("bu", { type: () => [String] }) bu: string[],
    @Args() paginationArgs: PaginationArgs,
    @Args() sorterArgs: SorterArgs,
    @Args("favorOnly", { type: () => Boolean }) favorOnly: boolean,
    defaultCoverageDim: string,
  ): Promise<GetProjectsResponseModel> {
    return this.getProjectsService.invoke(
      {
        userID: user?.id,
        current: paginationArgs.current,
        pageSize: paginationArgs.pageSize,
        keyword,
        bu,
        field: sorterArgs.field,
        order: sorterArgs.order,
        favorOnly,
        defaultCoverageDim,
      }
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => GetProjectCommitsResponseModel, {
    description: "获取项目提交记录",
  })
  getProjectCommits(
    @Args() args: GetProjectCommitsRequestModel,
  ): Promise<GetProjectCommitsResponseModel> {
    return this.getProjectCommitsService.invoke(
      args.projectID,
      args.branch,
      args.current,
      args.pageSize,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [GetProjectCommitCoverageResponseModel], {
    description: "获取项目提交覆盖率",
  })
  getProjectCommitCoverage(
    @Args() args: GetProjectCommitCoverageRequestModel,
  ): Promise<GetProjectCommitCoverageResponseModel[]> {
    return this.getProjectCommitCoverageService.invoke(
      args.projectID,
      args.sha,
    );
  }

}
