import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OrganizationModel {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;
}
