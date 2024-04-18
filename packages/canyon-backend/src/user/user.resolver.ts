import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './user.model';
import { UseGuards } from '@nestjs/common';

import { UserService } from './user.service';
import { GqlUser } from '../decorators/gql-user.decorator';
import { GqlAuthGuard } from '../guards/gql-auth.guard';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, {
    description: '提供执行此查询的用户的详细信息（通过授权 Bearer 标头）',
  })
  @UseGuards(GqlAuthGuard)
  me(@GqlUser() user: User) {
    return this.userService.convertDbUserToUser(user);
  }

  @Mutation(() => User, {
    description: '关注项目',
  })
  @UseGuards(GqlAuthGuard)
  favorProject(
    @GqlUser() user: User,
    @Args('projectID', { type: () => ID }) projectID: string,
    @Args('favored', { type: () => Boolean }) favored: boolean,
  ) {
    return this.userService.favorProject(user, projectID, favored);
  }
}
