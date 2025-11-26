import { Body, Controller, Get, Post } from '@nestjs/common';
import { CodeService } from './service/code.service';

@Controller('code/diff')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @Get()
  async getDiff() {
    // TODO: 实现 GET /code/diff 逻辑
    return {};
  }

  @Post()
  async postDiff(
    @Body()
    body: { repoID: string; from: string; to: string },
  ) {
    // TODO: 实现 POST /code/diff 逻辑
    // 通过 gitlab 接口预先拉取变更代码文件及变更行
    const { repoID, from, to } = body;
    return {};
  }
}
