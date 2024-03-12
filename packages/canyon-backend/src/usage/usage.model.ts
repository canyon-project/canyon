import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UsageModel {
  @Field(() => ID)
  id: string;

  @Field(() => Number)
  size: number;
}
