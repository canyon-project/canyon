import { Field, ID, InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class RepoWhereUniqueArgs {
  @Field(() => ID)
  id!: string;
}

@InputType()
export class CreateRepoInput {
  @Field()
  id!: string;
  @Field()
  name!: string;
  @Field()
  pathWithNamespace!: string;
  @Field()
  description!: string;
  @Field()
  bu!: string;
  @Field({ description: 'JSON string for tags' })
  tags!: string;
  @Field({ description: 'JSON string for members' })
  members!: string;
  @Field()
  config!: string;
}

@InputType()
export class UpdateRepoInput extends PartialType(CreateRepoInput) {}
