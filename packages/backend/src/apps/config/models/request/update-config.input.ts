import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateConfigInput {
  @Field()
  key: string;

  @Field()
  value: string;
}