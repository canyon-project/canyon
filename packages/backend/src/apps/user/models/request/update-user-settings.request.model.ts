import {ArgsType, Field, Int} from "@nestjs/graphql";

@ArgsType()
export class UpdateUserSettingsRequestModel {
  @Field(() => String, {
    description: "主题",
    nullable: true,
  })
  theme?: string;

  @Field(() => String, {
    description: "语言",
    nullable: true,
  })
  language?: string;
}
