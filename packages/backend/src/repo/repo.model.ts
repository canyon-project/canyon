import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RepoModel {
  @Field(() => ID)
  id: string;

  @Field()
  pathWithNamespace: string;

  @Field()
  description: string;

  @Field()
  bu: string;

  @Field(() => String, { nullable: true, description: 'JSON string for tags' })
  // 使用字符串承载 JSON，避免 GraphQL 标量依赖在前后端不同步
  tags: string;

  @Field(() => String, {
    nullable: true,
    description: 'JSON string for members',
  })
  members: string;

  @Field()
  config: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
