import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RepoService } from './repo.service';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class RepoList {
  @Field(() => [String])
  items!: string[];

  @Field(() => String, { nullable: true })
  keyword?: string | null;
}

@ObjectType()
class RepoCommits {
  @Field()
  repoID!: string;

  @Field(() => [String])
  commits!: string[];
}

@ObjectType()
class RepoPulls {
  @Field()
  repoID!: string;

  @Field(() => [String])
  pulls!: string[];
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

@Resolver()
export class RepoResolver {
  constructor(private readonly repo: RepoService) {}

  @Query(() => RepoList)
  repos(@Args('keyword', { type: () => String, nullable: true }) keyword?: string) {
    return this.repo.getRepos(keyword);
  }

  @Query(() => RepoCommits)
  repoCommits(@Args('repoID', { type: () => String }) repoID: string) {
    return this.repo.getRepoCommits(repoID);
  }

  @Query(() => RepoPulls)
  repoPulls(@Args('repoID', { type: () => String }) repoID: string) {
    return this.repo.getRepoPulls(repoID);
  }

  @Query(() => RepoCommitDetail)
  repoCommitBySHA(
    @Args('repoID', { type: () => String }) repoID: string,
    @Args('sha', { type: () => String }) sha: string
  ) {
    return this.repo.getRepoCommitBySHA(repoID, sha);
  }

  @Mutation(() => RepoMutationResult)
  postRepoById(@Args('id', { type: () => String }) id: string) {
    return this.repo.postRepoById(id);
  }
}


