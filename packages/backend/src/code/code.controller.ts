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
    @Query('analysisNumber') analysisNumber?: string,
    @Query('filepath') filepath?: string,
    @Query('provider') provider?: string,
  ) {
    if (!repoID || !filepath) {
      return { content: null };
    }
    if (!sha && !analysisNumber) {
      return { content: null };
    }
    try {
      return await this.codeService.getFileContent({
        repoID,
        sha: sha || null,
        analysisNumber: analysisNumber || null,
        filepath,
        provider: provider || null,
      });
    } catch (error) {
      console.error('Failed to get file content:', error);
      return { content: null };
    }
  }


  @Get('diff')
  async getDiff() {
    // TODO: 实现 GET /code/diff 逻辑
    return {};
  }

  @Post('diff')
  async postDiff(
    @Body()
    body: {
      repoID: string;
      provider: string;
      subject: string;
      subjectID: string;
    },
  ) {
    const { repoID, provider, subjectID, subject } = body;

    // 先删除旧数据（根据 provider、repoID、subjectID、subject 匹配）
    await this.prisma.diff.deleteMany({
      where: {
        provider,
        repo_id: repoID,
        subject_id: subjectID,
        subject,
      },
    });

    // 通过 service 获取代码差异数据
    const data = await this.codeService.getDiffForMultipleCommits({
      repoID,
      provider,
      subjectID,
    });

    // 保存到数据库
    await this.prisma.diff.createMany({
      data: data,
      skipDuplicates: true,
    });

    return data;
  }
}
