import { Args, Query, Resolver } from '@nestjs/graphql';
import { Field, ObjectType } from '@nestjs/graphql';
import { CodeService } from './code.service';

@ObjectType()
class CodeFileContent {
  @Field(() => String, { nullable: true })
  content?: string | null;
}

@Resolver()
export class CodeResolver {
  constructor(private readonly code: CodeService) {}

  @Query(() => CodeFileContent)
  async codeFileContent(
    @Args('repoID', { type: () => String }) repoID: string,
    @Args('filepath', { type: () => String }) filepath: string,
    @Args('sha', { type: () => String, nullable: true }) sha?: string,
    @Args('pullNumber', { type: () => String, nullable: true }) pullNumber?: string,
    @Args('provider', { type: () => String, nullable: true }) provider?: string
  ) {
    return this.code.getFileContent({ repoID, sha, pullNumber, filepath, provider });
  }

  @Query(() => String)
  async codePullRequest(
    @Args('projectID', { type: () => String }) projectID: string,
    @Args('pullRequestID', { type: () => String }) pullRequestID: string
  ): Promise<string> {
    const r = await this.code.getPullRequest({ projectID, pullRequestID });
    return JSON.stringify(r);
  }

  @Query(() => String)
  async codePullRequestChanges(
    @Args('projectID', { type: () => String }) projectID: string,
    @Args('pullRequestID', { type: () => String }) pullRequestID: string
  ): Promise<string> {
    const r = await this.code.getPullRequestChanges({ projectID, pullRequestID });
    return JSON.stringify(r);
  }

  @Query(() => String)
  async codeProjectByPath(@Args('path', { type: () => String }) path: string): Promise<string> {
    const r = await this.code.getProjectByPath(path);
    return JSON.stringify(r);
  }
}


