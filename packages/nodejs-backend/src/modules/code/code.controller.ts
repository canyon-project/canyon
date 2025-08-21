import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CodeService } from './code.service';

@Controller('code')
export class CodeController {
  constructor(private readonly code: CodeService) {}

  @Get('')
  getFileContent(
    @Query('repoID') repoID: string,
    @Query('sha') sha: string,
    @Query('pullNumber') pullNumber: string,
    @Query('filepath') filepath: string,
    @Query('provider') provider = 'gitlab'
  ) {
    return this.code.getFileContent({ repoID, sha, pullNumber, filepath, provider });
  }

  @Get('pulls/:projectID/:pullRequestID')
  getPullRequest(@Param('projectID') projectID: string, @Param('pullRequestID') pullRequestID: string) {
    return this.code.getPullRequest({ projectID, pullRequestID });
  }

  @Get('pulls/:projectID/:pullRequestID/changes')
  getPullRequestChanges(@Param('projectID') projectID: string, @Param('pullRequestID') pullRequestID: string) {
    return this.code.getPullRequestChanges({ projectID, pullRequestID });
  }

  @Get('projects/*')
  getProjectByPath(@Req() req: Request) {
    const path = (req.params as any)[0] as string;
    return this.code.getProjectByPath(path);
  }
}


