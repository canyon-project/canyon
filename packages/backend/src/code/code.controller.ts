import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CodeService } from './service/code.service';
@Controller('api/code')
export class CodeController {
  constructor(
    private readonly codeService: CodeService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('file')
  async getFileContent(
    @Query('repoID') repoID: string,
    @Query('sha') sha?: string,
    @Query('pullNumber') pullNumber?: string,
    @Query('filepath') filepath?: string,
    @Query('provider') provider?: string,
  ) {
    if (!repoID || !filepath) {
      return { content: null };
    }
    if (!sha && !pullNumber) {
      return { content: null };
    }
    try {
      return await this.codeService.getFileContent({
        repoID,
        sha: sha || null,
        pullNumber: pullNumber || null,
        filepath,
        provider: provider || null,
      });
    } catch (error) {
      console.error('Failed to get file content:', error);
      return { content: null };
    }
  }
}
