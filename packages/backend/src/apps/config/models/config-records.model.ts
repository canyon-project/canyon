import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ConfigRecord {
  @Field()
  id: string;

  @Field()
  key: string;

  @Field()
  value: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}