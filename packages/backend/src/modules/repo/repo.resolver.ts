import {
  Args,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { JSONScalar } from '../../scalars/json.scalar';
import { RepoService } from './repo.service';

@ObjectType()
class Scope {
  @Field()
  buildTarget!: string;
  @Field(() => [String])
  includes!: string[];
  @Field(() => [String])
  excludes!: string[];
}

@ObjectType()
class Repo {
  @Field()
  id!: string;

  @Field()
  pathWithNamespace!: string;

  @Field()
  description!: string;

  @Field()
  bu!: string;

  @Field()
  config!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
class RepoList {
  @Field(() => [JSONScalar])
  data: unknown[];

  @Field(() => String, { nullable: true })
  keyword?: string | null;
}

@ObjectType()
class RepoCommits {
  @Field()
  repoID: string;

  @Field(() => [JSONScalar])
  commits: unknown[];
}

@ObjectType()
class RepoPulls {
  @Field()
  repoID!: string;

  @Field(() => [JSONScalar])
  pulls!: unknown[];
}

@ObjectType()
class RepoCommitDetail {
  @Field()
  repoID!: string;

  @Field()
  sha!: string;

  @Field(() => String, { nullable: true })
  commit?: string | null;
}

@ObjectType()
class RepoMutationResult {
  @Field()
  ok!: boolean;

  @Field()
  id!: string;
}

@ObjectType()
class RepoUpdateResult {
  @Field()
  ok!: boolean;

  @Field()
  id!: string;
}

@Resolver()
export class RepoResolver {
  constructor(private readonly repoService: RepoService) {}
  @Query(() => RepoList)
  repos(
    @Args('keyword', { type: () => String, nullable: true }) keyword?: string,
    @Args('bu', { type: () => [String], nullable: true }) bu?: string[],
  ) {
    return this.repoService.getRepos();
  }
}
