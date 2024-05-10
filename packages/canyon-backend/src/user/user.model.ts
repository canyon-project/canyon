import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  username: string;

  @Field()
  password: string;

  @Field()
  nickname: string;

  @Field()
  avatar: string;

  @Field()
  refreshToken: string;

  @Field()
  accessToken: string;

  @Field()
  email: string;

  @Field()
  favor: string;

  @Field()
  createdAt: Date;
}
