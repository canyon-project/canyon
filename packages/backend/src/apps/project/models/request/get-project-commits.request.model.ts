import { ArgsType, Field, ID, Int } from '@nestjs/graphql';

@ArgsType()
export class GetProjectCommitsRequestModel {
  @Field(() => ID, {
    description: '项目ID',
  })
  projectID: string;

  @Field(() => String, {
    description: '分支名称',
    nullable: true,
  })
  branch?: string;

  @Field(() => Int, {
    description: '当前页码',
  })
  current: number;

  @Field(() => Int, {
    description: '每页数量',
  })
  pageSize: number;
}
