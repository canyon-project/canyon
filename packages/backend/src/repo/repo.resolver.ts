import { Args, Query, Resolver } from '@nestjs/graphql';
// import {JSONScalar} from "../scalars/json.scalar";
import { GetUserRequestArgs } from './input-type.args';
import { UserHistory } from './repo.model';
// import { JSONScalar } from '../../scalars/json.scalar';
import { RepoService } from './repo.service';

@Resolver()
export class RepoResolver {
  constructor(private readonly repoService: RepoService) {}

  @Query(() => UserHistory)
  repos(@Args() args: GetUserRequestArgs) {
    console.log(args);
    return this.repoService.getHello();
  }
}
