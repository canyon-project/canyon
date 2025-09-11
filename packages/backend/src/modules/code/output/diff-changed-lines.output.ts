import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DiffFileLines {
  @Field(() => String)
  path!: string;

  @Field(() => [Number])
  added!: number[];

  @Field(() => [Number])
  removed!: number[];
}

@ObjectType()
export class CodeDiffChangedLinesOutput {
  @Field(() => [DiffFileLines])
  files!: DiffFileLines[];
}
