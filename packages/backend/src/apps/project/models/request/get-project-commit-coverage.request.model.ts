import { ArgsType, Field, ID } from '@nestjs/graphql';

@ArgsType()
export class GetProjectCommitCoverageRequestModel {
  @Field(() => ID, {
    description: '项目ID',
  })
  projectID: string;

  @Field(() => String, {
    description: '提交ID',
  })
  sha: string;
}
