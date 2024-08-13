import { Args, ID, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GqlAuthGuard } from "../guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { GqlUser } from "../decorators/gql-user.decorator";
import { AuthUser } from "../types/AuthUser";
import { BuOption, Project } from "./project.model";
import { ProjectPagesModel } from "./models/project-pages.model";
import { ProjectService } from "./services/project.service";
import { GetProjectChartDataService } from "./services/get-project-chart-data.service";
import { ProjectChartDataModel } from "./models/project-chart-data.model";
import { GetProjectRecordsService } from "./services/get-project-records.service";
import { ProjectRecordsPagesModel } from "./models/project-records-pages.model";
import { GetProjectCompartmentDataService } from "./services/get-project-compartment-data.service";
import { ProjectCompartmentDataModel } from "./models/project-compartment-data.model";
import { GetProjectRecordDetailByShaService } from "./services/get-project-record-detail-by-sha.service";
import {
  DeleModel,
  ProjectRecordDetailModel,
} from "./models/project-record-detail.model";
import { Project2 } from "./models/project2.model";
import { PaginationArgs, SorterArgs } from "../types/input-types.args";
import { GetProjectsService } from "./services/get-projects.service";
import { User } from "../user/user.model";
import { UpdateProjectArgs } from "./input-type.args";
import { DeleteProjectRecordService } from "./services/delete-project-record.service";
import { UpdateProjectService } from "./services/crud/update-project.service";

@Resolver(() => "Project")
export class ProjectResolver {
  constructor(
    private readonly projectService: ProjectService,
    private readonly getProjectChartDataService: GetProjectChartDataService,
    private readonly getProjectRecordsService: GetProjectRecordsService,
    private readonly getProjectCompartmentDataService: GetProjectCompartmentDataService,
    private readonly getProjectRecordDetailByShaService: GetProjectRecordDetailByShaService,
    private readonly getProjectsService: GetProjectsService,
    private readonly deleteProjectRecordService: DeleteProjectRecordService,
    private readonly updateProjectService: UpdateProjectService,
  ) {}
  @UseGuards(GqlAuthGuard)
  @Query(() => ProjectPagesModel, {
    description: "获取Project",
  })
  getProjects(
    @GqlUser() user: User,
    @Args("keyword", { type: () => String }) keyword: string,
    @Args("lang", { type: () => [String] }) lang: string[],
    @Args("bu", { type: () => [String] }) bu: string[],
    @Args() paginationArgs: PaginationArgs,
    @Args() sorterArgs: SorterArgs,
    @Args("favorOnly", { type: () => Boolean }) favorOnly: boolean,
  ): Promise<ProjectPagesModel> {
    return this.getProjectsService.invoke(
      user?.id,
      paginationArgs.current,
      paginationArgs.pageSize,
      keyword,
      lang,
      bu,
      sorterArgs.field,
      sorterArgs.order,
      favorOnly,
    );
  }

  @Query(() => [BuOption], {
    description: "获取Projects部门选项",
  })
  getProjectsBuOptions(): Promise<BuOption[]> {
    return this.projectService.getProjectsBuOptions();
  }

  @Query(() => [ProjectChartDataModel], {
    description: "获取Project图表",
  })
  getProjectChartData(
    @Args("projectID", { type: () => String }) projectID: string,
    @Args("branch", { type: () => String }) branch: string,
  ): Promise<ProjectChartDataModel[]> {
    return this.getProjectChartDataService.invoke(projectID, branch);
  }

  @Query(() => [ProjectCompartmentDataModel], {
    description: "获取Project宫格",
  })
  getProjectCompartmentData(
    @Args("projectID", { type: () => String }) projectID: string,
  ): Promise<ProjectCompartmentDataModel[]> {
    return this.getProjectCompartmentDataService.invoke(projectID);
  }

  @Query(() => ProjectRecordsPagesModel, {
    description: "获取Project记录",
  })
  getProjectRecords(
    @Args("projectID", { type: () => String }) projectID: string,
    @Args("current", { type: () => Int }) current: number,
    @Args("pageSize", { type: () => Int }) pageSize: number,
    @Args("keyword", { type: () => String }) keyword: string,
    @Args("onlyDefault", { type: () => Boolean, nullable: true })
    onlyDefault?: boolean,
  ): Promise<ProjectRecordsPagesModel> {
    return this.getProjectRecordsService.invoke(
      projectID,
      current,
      pageSize,
      keyword,
      onlyDefault,
    );
  }

  @Query(() => Project)
  getProjectByID(
    @Args("projectID", { type: () => ID }) projectID: string,
  ): Promise<Project> {
    return this.projectService.getProjectByID(projectID);
  }

  @Query(() => [ProjectRecordDetailModel], {
    description: "获取Project记录的详细通过sha",
  })
  getProjectRecordDetailBySha(
    @Args("projectID", { type: () => ID }) projectID: string,
    @Args("sha", { type: () => String }) sha: string,
  ): Promise<Project> {
    return this.getProjectRecordDetailByShaService.invoke(projectID, sha);
  }

  // getProjectRecords
  // getProjectChartData
  // getProjectCompartmentData

  @Mutation(() => Project2, {
    description: "检查输入的gitlab链接",
  })
  @UseGuards(GqlAuthGuard)
  checkProjectUrl(
    @GqlUser() user: AuthUser,
    @Args("projectUrl", { type: () => String }) projectUrl: string,
  ): Promise<Project2> {
    return this.projectService.checkProjectUrl(user, projectUrl);
  }

  @Mutation(() => Project2, {
    description: "创建项目",
  })
  @UseGuards(GqlAuthGuard)
  createProject(
    @GqlUser() user: AuthUser,
    @Args("projectID", { type: () => String }) projectID: string,
    @Args("language", { type: () => String }) language: string,
  ): Promise<Project2> {
    return this.projectService.createProject(user, projectID, language);
  }

  @Mutation(() => Project2, {
    description: "删除项目",
  })
  @UseGuards(GqlAuthGuard)
  deleteProject(
    @GqlUser() user: AuthUser,
    @Args("projectID", { type: () => String }) projectID: string,
  ): Promise<Project2> {
    return this.projectService.deleteProject(user, projectID);
  }

  @Mutation(() => Project2, {
    description: "更新项目",
  })
  @UseGuards(GqlAuthGuard)
  updateProject(
    @GqlUser() user: AuthUser,
    @Args() args: UpdateProjectArgs,
  ): Promise<Project2> {
    const { projectID, ...otherData } = args;
    return this.updateProjectService.invoke(
      user,
      projectID,
      otherData,
      // args.rules,
    );
  }

  @Mutation(() => DeleModel, {
    description: "删除sha记录",
  })
  @UseGuards(GqlAuthGuard)
  deleteProjectRecord(
    @GqlUser() currentUser: AuthUser,
    @Args("projectID", { type: () => ID }) projectID: string,
    @Args("sha", { type: () => String }) sha: string,
  ): Promise<{ count: number }> {
    return this.deleteProjectRecordService.invoke(currentUser, projectID, sha);
  }
}
