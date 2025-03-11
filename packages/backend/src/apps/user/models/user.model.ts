import { Field, ID, ObjectType } from "@nestjs/graphql";

// UserSettingsModel

@ObjectType()
export class UserSettingsModel {
  @Field()
  theme: string;

  @Field()
  language: string;
}

@ObjectType()
export class UserModel {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field()
  password: string;

  @Field()
  nickname: string;

  @Field()
  avatar: string;

  // @Field()
  // refreshToken: string;
  //
  // @Field()
  // accessToken: string;

  @Field()
  email: string;

  @Field()
  favor: string;

  @Field()
  createdAt: Date;

  @Field()
  settings: UserSettingsModel;
}
