import { Body, Controller, Get, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CodeService } from './service/code.service';
@Controller('code/diff')
export class CodeController {
  constructor(
    private readonly codeService: CodeService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getDiff() {
    // TODO: 实现 GET /code/diff 逻辑
    return {};
  }

  @Post()
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
