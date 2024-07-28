import { ArgsType, Field, ID, InputType } from "@nestjs/graphql";

@InputType() // 定义规则输入类型
class TagInput {
  @Field()
  id: string;
  @Field()
  name: string;
  @Field()
  link: string;
  @Field()
  color: string;
}

@InputType() // 定义规则输入类型
class MemberInput {
  @Field()
  userID: string;
  @Field()
  role: string;
}

@ArgsType()
export class UpdateProjectArgs {
  @Field(() => ID, {
    description: "Project ID",
  })
  projectID: string;

  @Field({
    nullable: true,
  })
  description?: string;

  @Field({
    nullable: true,
  })
  instrumentCwd?: string;

  @Field({
    nullable: true,
  })
  coverage?: string;

  @Field({
    nullable: true,
  })
  defaultBranch?: string;

  @Field(() => [TagInput], {
    nullable: true,
  })
  tags?: TagInput[];

  @Field(() => [MemberInput], {
    nullable: true,
  })
  members?: MemberInput[];
}
