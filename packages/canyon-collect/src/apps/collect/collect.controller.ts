import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoverageClientService } from './services/coverage-client.service';
import { CoverageClientDto } from './dto/coverage-client.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CoverageMapClientService } from './services/coverage-map-client.service';
import { CoverageMapClientDto } from './dto/coverage-map-client.dto';
import zlib from 'zlib';
// 解压 GZIP 的 Buffer 数据
async function decompressData(buffer) {
  return new Promise((resolve, reject) => {
    zlib.gunzip(buffer, (err, decompressed) => {
      if (err) {
        return reject(err);
      }
      resolve(decompressed.toString('utf-8')); // 转换为字符串返回
    });
  });
}
@Controller()
export class CollectController {
  constructor(
    private readonly prisma: PrismaService,
    private coverageClientService: CoverageClientService,
    private coverageMapClientService: CoverageMapClientService,
  ) {}

  /*
  核心代码
  1. 接受application/json类型的数据，coverage可以是对象或者字符串
  2. 接受formData类型的数据，coverage是二进制数据，可以是compressDataWithStream压缩过的，也可以是json字符串
  3. 根据cov.mimetype === 'application/octet-stream'判断是否被compressDataWithStream
  4. 经过测试在macbookpro上compressDataWithStream压缩1600kb的数据，压缩后64kb左右，耗时8ms左右
  TODO 得调研8ms对navigator.sendBeacon有没有影响
   */
  @UseInterceptors(FileInterceptor('coverage'))
  @Post('coverage/client')
  async coverageClient(
    @UploadedFile() cov: any,
    @Body() coverageClientDto: CoverageClientDto,
  ) {
    // console.log(coverageClientDto.coverage)
    if (coverageClientDto.coverage) {
      return this.coverageClientService.invoke(coverageClientDto);
    }
    let coverage = {};
    if (cov.mimetype === 'application/octet-stream') {
      coverage = await decompressData(cov.buffer).then((jsonString: any) =>
        JSON.parse(jsonString),
      );
    } else {
      // 先将buffer中的二进制数据转换为字符串
      const jsonString = cov.buffer.toString();

      coverage = JSON.parse(jsonString);
    }

    return this.coverageClientService.invoke({
      ...coverageClientDto,
      coverage,
    });
  }

  @Post('coverage/map/client')
  coverageMapClient(@Body() coverageMapClientDto: CoverageMapClientDto) {
    return this.coverageMapClientService.invoke(coverageMapClientDto);
  }
}
