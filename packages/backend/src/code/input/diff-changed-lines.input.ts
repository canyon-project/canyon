import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CodeDiffChangedLinesInput {
  @Field(() => String)
  repoID!: string;

  @Field(() => String, { nullable: true })
  provider?: string;

  @Field(() => String)
  subject!: string;

  @Field(() => String)
  subjectID!: string;

  @Field(() => String, { nullable: true })
  compareTarget?: string;

  @Field(() => String, { nullable: true })
  filepath?: string;
}
