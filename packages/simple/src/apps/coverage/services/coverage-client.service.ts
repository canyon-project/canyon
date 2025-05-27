import { Inject, Injectable } from '@nestjs/common';
import { CoverageClientDto } from '../dto/coverage-client.dto';

// 核心逻辑，需要用buildID获取所有关联的map，而不是单纯的通过coverageId获取到的
@Injectable()
export class CoverageClientService {
  async invoke(
    reporter: string,
    {
      provider,
      sha,
      repoID,
      coverage,
      instrumentCwd,
      reportID, // Option
      branch, // Option
      compareTarget, // Option
      buildID, // Option
      buildProvider, // Option
      reportProvider, // Option
    }: CoverageClientDto,
  ) {
    return {}
  }
}
