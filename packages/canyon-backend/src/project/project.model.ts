import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Tag {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  link: string;

  @Field(() => String)
  color: string;
}

@ObjectType()
export class Member {
  @Field(() => String)
  userID: string;

  @Field(() => String)
  role: string;
}

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
  coverage: string;

  @Field(() => String)
  language: string;

  @Field(() => [Tag])
  tags: Tag[];

  @Field(() => [Member])
  members: Member[];

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

  @Field(() => Boolean)
  favored: boolean;

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
