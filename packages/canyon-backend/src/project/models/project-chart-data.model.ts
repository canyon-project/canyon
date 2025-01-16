import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ProjectChartDataModel {
  @Field(() => Number, {
    description: "语句覆盖率",
  })
  statements: number;

  @Field(() => Number, {
    description: "行覆盖率",
  })
  lines: number;

  @Field(() => Number, {
    description: "分支覆盖率",
  })
  branches: number;

  @Field(() => Number, {
    description: "函数覆盖率",
  })
  functions: number;

  @Field(() => Number, {
    description: "New Lines",
  })
  newlines: number;
  @Field(() => String, {
    description: "sha",
  })
  sha: string;
}
