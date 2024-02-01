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
  bu: string;

  @Field(() => Number)
  maxCoverage: number;

  @Field(() => Number)
  reportTimes: number;

  @Field(() => Date)
  lastReportTime: Date;
}

// buOption

@ObjectType()
export class BuOption {
  @Field(() => String)
  bu: string;
}
