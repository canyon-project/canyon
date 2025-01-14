import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ProjectRecordDetailModel {
  @Field(() => String, {
    description: "ID",
  })
  id: string;
  @Field(() => String, {
    description: "Commit Sha",
  })
  sha: string;
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
  @Field(() => Date, {
    description: "最近一次上报时间",
  })
  lastReportTime: string;
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
export class DeleModel {
  @Field(() => Number, {
    description: "删除数量",
  })
  count: number;
}
