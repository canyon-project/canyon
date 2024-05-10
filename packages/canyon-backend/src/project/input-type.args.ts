import { ArgsType, Field, ID, InputType } from '@nestjs/graphql';

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

@ArgsType()
export class UpdateProjectArgs {
  @Field(() => ID, {
    description: 'Project ID',
  })
  projectID: string;

  @Field()
  description: string;

  @Field()
  tag: string;

  @Field()
  coverage: string;

  @Field()
  defaultBranch: string;

  @Field(() => [TagInput], {
    nullable: true,
  })
  tags?: TagInput[];
}
