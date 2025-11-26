import { Body, Controller, Get, Post } from '@nestjs/common';
import { CodeService } from './service/code.service';
import { diffLine } from '../helpers/diff';
import { PrismaService } from '../prisma/prisma.service';
@Controller('code/diff')
export class CodeController {
  constructor(private readonly codeService: CodeService, private readonly prisma: PrismaService) {}

  @Get()
  async getDiff() {
    // TODO: 实现 GET /code/diff 逻辑
    return {};
  }

  @Post()
  async postDiff(
    @Body()
    body: { repoID: string; provider: string; from: string; to: string },
  ) {
    // TODO: 实现 POST /code/diff 逻辑
    // 通过 gitlab 接口预先拉取变更代码文件及变更行
    const { repoID, provider, from, to  } = body;
    const { base, token  } = await this.codeService.getGitLabCfg();
    
    const result = await diffLine({
      repoID,
      baseCommitSha: from,
      compareCommitSha: to,
      includesFileExtensions: ["ts", "tsx", "jsx", "vue", "js"],
      gitlabUrl: base,
      token,
    });
    const data = result.map(({ path, additions, deletions }) => {
      return {
        provider: provider,
        repo_id: repoID,
        from: from,
        to: to,
        subject_id: to,
        subject: 'commit',
        path,
        additions,
        deletions,
      };
    });
    await this.prisma.diff.createMany({// code change 做了对比
      data: data,
      skipDuplicates: true,
    });
    return data;
  }
}
