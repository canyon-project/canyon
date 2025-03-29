import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CoverageRecordsModel {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
