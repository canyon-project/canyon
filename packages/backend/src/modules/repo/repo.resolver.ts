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

  @Field(() => [Scope])
  scopes!: Scope[];

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

  @Query(() => Repo)
  repo(@Args('id', { type: () => String }) id: string) {
    return this.repoService.getRepo(id);
  }

  @Query(() => RepoList)
  repos(
    @Args('keyword', { type: () => String, nullable: true }) keyword?: string,
    @Args('bu', { type: () => [String], nullable: true }) bu?: string[],
  ) {
    return this.repoService.getRepos(keyword, bu);
  }

  @Query(() => RepoCommits)
  repoCommits(@Args('repoID', { type: () => String }) repoID: string) {
    return this.repoService.getRepoCommits(repoID);
  }

  @Query(() => RepoPulls)
  repoPulls(@Args('repoID', { type: () => String }) repoID: string) {
    return this.repoService.getRepoPulls(repoID);
  }

  @Query(() => RepoCommitDetail)
  repoCommitBySHA(
    @Args('repoID', { type: () => String }) repoID: string,
    @Args('sha', { type: () => String }) sha: string,
  ) {
    return this.repoService.getRepoCommitBySHA(repoID, sha);
  }

  @Mutation(() => RepoMutationResult)
  postRepoById(@Args('id', { type: () => String }) id: string) {
    return this.repoService.postRepoById(id);
  }

  @Mutation(() => RepoUpdateResult)
  updateRepo(
    @Args('id', { type: () => String }) id: string,
    @Args('bu', { type: () => String, nullable: true }) bu?: string,
    @Args('description', { type: () => String, nullable: true })
    description?: string,
  ) {
    return this.repoService.updateRepo(id, bu, description);
  }
}
