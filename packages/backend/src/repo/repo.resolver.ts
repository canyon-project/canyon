import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateRepoInput,
  RepoWhereUniqueArgs,
  UpdateRepoInput,
} from './input-type.args';
import { RepoModel } from './repo.model';
import { RepoService } from './repo.service';

@Resolver()
export class RepoResolver {
  constructor(private readonly repoService: RepoService) {}

  // Queries
  @Query(() => [RepoModel])
  repos() {
    return this.repoService.list();
  }

  @Query(() => RepoModel, { nullable: true })
  repo(@Args('id', { type: () => ID }) id: string) {
    return this.repoService.get(id);
  }

  // Mutations
  @Mutation(() => RepoModel)
  createRepo(@Args('input') input: CreateRepoInput) {
    return this.repoService.create(input);
  }

  @Mutation(() => RepoModel)
  updateRepo(
    @Args('where') where: RepoWhereUniqueArgs,
    @Args('input') input: UpdateRepoInput,
  ) {
    return this.repoService.update(where.id, input);
  }

  @Mutation(() => RepoModel)
  deleteRepo(@Args('where') where: RepoWhereUniqueArgs) {
    return this.repoService.remove(where.id);
  }
}
