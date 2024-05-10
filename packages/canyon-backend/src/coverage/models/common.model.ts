import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Statistics2 {
  @Field(() => Number)
  total: number;
  @Field(() => Number)
  covered: number;
  @Field(() => Number)
  skipped: number;
  @Field(() => Number)
  pct: number;
}
