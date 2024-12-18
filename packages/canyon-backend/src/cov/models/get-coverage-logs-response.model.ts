import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class CoverageLogTag {
  @Field(() => String)
  label: string;
  @Field(() => String)
  value: string;
}

@ObjectType()
export class GetCoverageLogsResponseModel {
  @Field(() => String)
  id: string;

  @Field(() => String)
  projectID: string;

  @Field(() => String)
  sha: string;

  @Field(() => String)
  reportID: string;

  @Field(() => Number)
  size: number;

  @Field(() => [CoverageLogTag])
  tags: CoverageLogTag[];
}
