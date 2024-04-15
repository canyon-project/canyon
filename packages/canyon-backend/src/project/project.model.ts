import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Project {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  pathWithNamespace: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  tag: string;

  @Field(() => String)
  coverage: string;

  @Field(() => String)
  bu: string;

  @Field(() => [String])
  branchOptions: string[];

  @Field(() => Number)
  maxCoverage: number;

  @Field(() => String)
  defaultBranch: string;

  @Field(() => Number)
  reportTimes: number;

  @Field(() => Date)
  lastReportTime: Date;

  @Field(() => Date)
  createdAt: Date;
}

// buOption

@ObjectType()
export class BuOption {
  @Field(() => String)
  bu: string;
  @Field(() => Number)
  count: number;
}
