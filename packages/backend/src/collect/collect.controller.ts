import { Body, Controller, Get, Post } from '@nestjs/common';
import { CoverageClientDto } from './dto/coverage-client.dto';
import { CoverageMapInitDto } from './dto/coverage-map-init.dto';
import { formatCoverageData } from './helpers/formatCoverageData';
import { CoverageClientService } from './services/coverage-client.service';
import { CoverageMapInitService } from './services/coverage-map-init.service';

// @Public()
@Controller('api/coverage')
export class CollectController {
  constructor(
    private coverageClientService: CoverageClientService,
    private coverageMapInitService: CoverageMapInitService,
  ) {}
  @Post('client')
  async uploadCoverageFromClient(@Body() coverageClientDto: CoverageClientDto) {
    return this.coverageClientService.invoke('1', {
      coverage: formatCoverageData(coverageClientDto.coverage),
      scene: coverageClientDto.scene,
    });
  }

  @Post('map/init')
  async coverageMapInit(@Body() coverageMapInitDto: CoverageMapInitDto) {
    // 过滤掉 coverage 中 value 里有 oldPath 字段的项
    const filteredCoverage: Record<string, any> = {};
    for (const [key, value] of Object.entries(coverageMapInitDto.coverage)) {
      if (value && typeof value === 'object' && !('oldPath' in value)) {
        filteredCoverage[key] = value;
      }
    }
    coverageMapInitDto.coverage = filteredCoverage;

    // 从 coverage 的第一个值中提取参数
    const coverageValues = Object.values(coverageMapInitDto.coverage);
    if (coverageValues.length > 0) {
      const firstEntry = coverageValues[0] as any;
      // 如果第一个值中存在这些字段，则覆盖 DTO 中的值
      if (firstEntry.sha !== undefined) {
        coverageMapInitDto.sha = firstEntry.sha;
        console.log(`从 coverage 的第一个值中提取的 sha: ${firstEntry.sha}`);
      }
      if (firstEntry.provider !== undefined) {
        coverageMapInitDto.provider = firstEntry.provider;
        console.log(
          `从 coverage 的第一个值中提取的 provider: ${firstEntry.provider}`,
        );
      }
      if (firstEntry.repoID !== undefined) {
        coverageMapInitDto.repoID = firstEntry.repoID;
        console.log(
          `从 coverage 的第一个值中提取的 repoID: ${firstEntry.repoID}`,
        );
      }
      if (firstEntry.instrumentCwd !== undefined) {
        coverageMapInitDto.instrumentCwd = firstEntry.instrumentCwd;
        console.log(
          `从 coverage 的第一个值中提取的 instrumentCwd: ${firstEntry.instrumentCwd}`,
        );
      }
      if (firstEntry.buildTarget !== undefined) {
        coverageMapInitDto.buildTarget = firstEntry.buildTarget;
        console.log(
          `从 coverage 的第一个值中提取的 buildTarget: ${firstEntry.buildTarget}`,
        );
      }
      return this.coverageMapInitService.init(coverageMapInitDto);
    } else {
      return {
        success: false,
        message: 'Coverage data is empty, cannot extract parameters.',
      };
    }
  }
}
