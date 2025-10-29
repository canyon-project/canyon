import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserHistory {
  @Field(() => ID, {
    description: 'ID of the user request in history',
  })
  id: string;

  @Field(() => ID, {
    description: 'ID of the user this history belongs to',
  })
  userUid: string;
}
