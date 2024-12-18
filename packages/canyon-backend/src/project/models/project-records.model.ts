import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
class Log {
  @Field(() => String, {
    description: "ID",
  })
  id: string;
  @Field(() => String, {
    description: "Commit Sha",
  })
  commitSha: string;
  @Field(() => String, {
    description: "上报ID",
  })
  reportID: string;
  @Field(() => String, {
    description: "关系ID",
  })
  relationID: string;
  @Field(() => Date, {
    description: "创建时间",
  })
  createdAt: string;
  @Field(() => String, {
    description: "上报人",
  })
  reporterUsername: string;
  @Field(() => String, {
    description: "上报人头像",
  })
  reporterAvatar: string;

  @Field(() => Number, {
    description: "新增",
  })
  newlines: number;

  @Field(() => Number, {
    description: "全量",
  })
  statements: number;
}

@ObjectType()
export class ProjectRecordsModel {
  @Field(() => String, {
    description: "commit信息",
  })
  message: string;
  @Field(() => String, {
    description: "commit sha",
  })
  sha: string;

  @Field(() => String, {
    description: "Compare Target",
  })
  compareTarget: string;

  @Field(() => String, {
    description: "branch",
  })
  branch: string;

  @Field(() => String, {
    description: "buildURL",
  })
  buildURL: string;

  @Field(() => String, {
    description: "buildID",
  })
  buildID: string;

  @Field(() => String, {
    description: "buildProvider",
  })
  buildProvider: string;

  @Field(() => String, {
    description: "Compare Url",
  })
  compareUrl: string;

  @Field(() => String, {
    description: "web url",
  })
  webUrl: string;

  @Field(() => Number, {
    description: "新增",
  })
  newlines: number;

  @Field(() => Number, {
    description: "全量",
  })
  statements: number;

  @Field(() => Number, {
    description: "分支覆盖率",
  })
  branches: number;

  @Field(() => Number, {
    description: "函数覆盖率",
  })
  functions: number;

  @Field(() => Number, {
    description: "行覆盖率",
  })
  lines: number;

  @Field(() => Date, {
    description: "最近一次上报",
  })
  lastReportTime: string;
  @Field(() => Number, {
    description: "上报次数",
  })
  times: number;
  @Field(() => [Log], {
    description: "上报日志",
  })
  logs: Log[];
}
