import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CommitModel {
  @Field(() => String)
  sha: string;

  @Field(() => String)
  commitMessage: string;

  @Field(() => Date)
  commitCreatedAt: Date;

  @Field(() => [String])
  branches: string[];

  @Field(() => Number, { nullable: true })
  coverage?: number;
}

@ObjectType()
export class GetProjectCommitsResponseModel {
  @Field(() => [CommitModel])
  data: CommitModel[];

  @Field(() => Number)
  total: number;
}