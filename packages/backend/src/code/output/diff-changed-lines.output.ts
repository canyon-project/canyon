import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DiffFileLines {
  @Field(() => String)
  path!: string;

  @Field(() => [Number])
  additions!: number[];

  // deletions

  @Field(() => [Number])
  deletions!: number[];
}

@ObjectType()
export class CodeDiffChangedLinesOutput {
  @Field(() => [DiffFileLines])
  files!: DiffFileLines[];
}
