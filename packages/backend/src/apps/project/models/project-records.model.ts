import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProjectRecordsModel {
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

  // @Field(() => String)
  // language: string;

  // @Field(() => [Tag])
  // tags: Tag[];
  //
  // @Field(() => [Member])
  // members: Member[];
  //
  // @Field(() => [AutoInstrument])
  // autoInstrument: AutoInstrument[];

  @Field(() => String)
  bu: string;

  @Field(() => [String])
  branchOptions: string[];

  @Field(() => Number)
  maxCoverage: number;

  @Field(() => String)
  defaultBranch: string;

  // @Field(() => String)
  // instrumentCwd: string;

  @Field(() => Number)
  reportTimes: number;

  @Field(() => Date)
  lastReportTime: Date;

  @Field(() => Boolean)
  favored: boolean;

  @Field(() => Date)
  createdAt: Date;
}
