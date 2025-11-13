import { Args, Field, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { CodeDiffChangedLinesInput } from './input/diff-changed-lines.input';
import { CodeDiffChangedLinesOutput } from './output/diff-changed-lines.output';
import { CodeService } from './service/code.service';

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
    @Args('pullNumber', { type: () => String, nullable: true })
    pullNumber?: string,
    @Args('provider', { type: () => String, nullable: true }) provider?: string,
  ) {
    return this.code.getFileContent({
      repoID,
      sha,
      pullNumber,
      filepath,
      provider,
    });
  }

  @Query(() => String)
  async codeProjectByPath(
    @Args('path', { type: () => String }) path: string,
  ): Promise<string> {
    const r = await this.code.getProjectByPath(path);
    return JSON.stringify(r);
  }

  @Query(() => CodeDiffChangedLinesOutput)
  async codeDiffChangedLines(
    @Args('input', { type: () => CodeDiffChangedLinesInput })
    input: CodeDiffChangedLinesInput,
  ): Promise<CodeDiffChangedLinesOutput> {
    const result = await this.code.getDiffChangedLines({
      repoID: input.repoID,
      provider: input.provider || null,
      subject: input.subject,
      subjectID: input.subjectID,
      compareTarget: input.compareTarget || null,
      filepath: input.filepath || null,
    });
    return result as CodeDiffChangedLinesOutput;
  }
}
