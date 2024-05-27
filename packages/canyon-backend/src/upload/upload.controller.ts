import {
  Controller,
  Post,
  Put,
  HttpCode,
  Query,
  Body,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { RawBodyMiddleware } from './raw-body.middleware';
import { uploadAnalyze } from './helpers/uploadAnalyze';
import axios from 'axios';
import * as process from 'process';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  @Post('v4')
  @HttpCode(200)
  test(@Query() q, @Body() b, @Req() req) {
    // TODO: 需要一个唯一id在post和put之间传递
    // 第一个参数 resultURL
    // 第二个参数 putURL
    return `${process.env.UPLOAD_URL}/upload/query
    ${process.env.UPLOAD_URL}${req.originalUrl}`;
  }
  @Put('v4')
  @HttpCode(200)
  @UseInterceptors(RawBodyMiddleware)
  async test1(@Query() query, @Body() buffer: Buffer) {
    const { commit, branch, instrument_cwd, slug } = query;
    const { coverage, type } = uploadAnalyze(buffer.toString());
    // TODO: 实现转换成canyon的数据结构
    const projectID = await axios
      .get(
        `${process.env.GITLAB_URL}/api/v4/projects/${encodeURIComponent(slug)}`,
        {
          headers: {
            // 我自己的token
            'PRIVATE-TOKEN': 'dpxTutmZv_wPogCkpCmc',
          },
        },
      )
      .then((res) => {
        return res.data.id;
      });
    const url = process.env.APP_URI;

    if (type === 'java') {
      return this.uploadService.jacoco(
        {
          branch: branch,
          commitSha: commit,
          projectID: String(projectID),
          instrumentCwd: instrument_cwd,
          coverage: coverage,
        },
        coverage,
      );
    }

    await axios
      .post(
        `${url}/coverage/client`,
        {
          branch: branch,
          coverage: coverage,
          commitSha: commit,
          projectID: String(projectID),
          instrumentCwd: instrument_cwd,
        },
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InR6aGFuZ20iLCJpZCI6ODQxNywiaWF0IjoxNzAxODUxNTQ1LCJleHAiOjIwMTc0Mjc1NDV9.Bx8pYLNP9XlmrPDlHNCz_M1A-VoEbhTx0njYyTr9n6Y`,
          },
        },
      )
      .then((res) => {
        console.log(res.data.message);
      });
    return 'ok';
  }
}
