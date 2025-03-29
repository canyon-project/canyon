import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CoverageClientDto } from '../dto/coverage-client.dto';
import { CoveragediskService } from './core/coveragedisk.service';
import {formatData} from "./common/format-data";
import {compressedData} from "./common/compress";
import {CoverageMapData, FileCoverage, FileCoverageData} from "istanbul-lib-coverage";
// import { CoverageMapClientService } from './coverage-map-client.service';
// import { IstanbulHitMapSchema } from '../../../zod/istanbul.zod';
// import { formatCoverageData, parseProjectID } from 'canyon-data';
// import { CoveragediskService } from './core/coveragedisk.service';
// import { CoverageFinalService } from './common/coverage-final.service';
// import { formatReportObject } from '../../../utils/coverage';
import libSourceMaps from "istanbul-lib-source-maps";
import libCoverage from "istanbul-lib-coverage";
import {remapCoverage} from "./common/remap-coverage";

// 此代码重中之重、核心中的核心！！！
@Injectable()
export class CoverageClientService {
  constructor(
    private readonly prisma: PrismaService,
    // private readonly coverageMapClientService: CoverageMapClientService,
    private coveragediskService: CoveragediskService,
    // private coverageFinalService: CoverageFinalService,
  ) {}
  async invoke(
    reporter: string,
    {
      sha,
      projectID,
      coverage,
      instrumentCwd,
      reportID, // 可选
      branch, // 可选
      compareTarget, //可选
      buildID, // 可选
      buildProvider, // 可选
      reportProvider, // 可选
      tags, // 可选
    }: CoverageClientDto,
  ) {
    // 0. 异步日志

    await this.prisma.coverageLog
      .create({
        data: {
          sha, // 定
          projectID, // 定
          // coverage: {},
          instrumentCwd, // 定
          reportID: reportID,
          reportProvider: reportProvider,
          branch, // 定
          compareTarget,
          reporter: '1',
          buildID,
          buildProvider,
          isHitAndMapSeparated: true,
          aggregatedState: 'UNPROCESSED',
          size: JSON.stringify(coverage).length,
          tags: {},
          provider: 'gitlab',
          // fileList: [], // 删除
          // provider: provider,
          // 忽略
          // nyc: 'x-product',
        },
      })
    // 1. coverage需要先判断是hit，还是map、

    // 2. 如果是map的话，

    // #region == Step x: 解析出上报上来的覆盖率数据
    const coverageFromExternalReport =
      formatData((typeof coverage === 'string' ? JSON.parse(coverage) : coverage));
    // #endregion

    // 首先就要判断，这个是可选步骤，所以用单if，以statementMap来判断

    if (
      Object.keys(coverageFromExternalReport).length > 0 &&
      // @ts-ignore
      Object.values(coverageFromExternalReport)[0]['statementMap']
    ) {
      const mapInset = await this.tryInsertCoverageMap(
        {
          sha,
          instrumentCwd,
          repoID: projectID,
          buildProvider,
          buildID,
        },
        coverageFromExternalReport,
      );
    }

    // await this.coveragediskService.pushQueue({
    //   projectID,
    //   sha,
    //   reportID,
    //   compareTarget: compareTarget || sha,
    //   coverage: JSON.stringify(coverageFromExternalReport),
    //   reporter,
    //   buildID,
    //   buildProvider,
    // });

    // pushQueue推到队列的应该是素人，为reMap过的数据

    // 消费，消费的时候先自己merge，merge完了以后再，确认能消费自己了再reMap

    // 开始消费啦！！

    // 合并后的数据，按需，确定sourceMap的list，进行remap过后再消费，性能！！！！

    // 接收到以后立马返回，提高性能
    return {
      msg: 'ok',
      coverageId: '',
      dataFormatAndCheckTime: '',
      coverageInsertDbTime: '',
    };
  }

  async tryInsertCoverageMap({
                               repoID,
                                sha,
                               instrumentCwd,
                                buildProvider,
    buildID,
                             },coverage:{
    [key: string]: FileCoverageData &{inputSourceMap?:object};
  }) {

    const provider = 'gitlab';

    // 1. 获取到文件列表，查询后，过滤出需要插入的
    // 2. sourceMap转换，减少性能损耗！！！！！！
    // 3. 插入的时候判断是否存在sourceMap!!!!


    const finds = await this.prisma.coverageMap.findMany({
      where:{
        id:{
          in:Object.keys(coverage).map(path=>`__${buildProvider}__${buildID}__${provider}__${repoID}__${sha}__${path}__`)
        }
      },
      select:{
        id:true,
      }
    })

    const keyiChaRufilelist = Object.keys(coverage).filter(path=>{      return finds.findIndex(f=>f.id===`__${buildProvider}__${buildID}__${provider}__${repoID}__${sha}__${path}__`)===-1
    })

    // 使用for...of循环处理异步操作
    const data:any[] = [];
    for (const [path, { branchMap, statementMap, fnMap, inputSourceMap,s,f,b }] of Object.entries(coverage).filter(([path]) => keyiChaRufilelist.includes(path))) {
// 记录开始时间
      const startTime = process.hrtime();
      const oldPath:any = inputSourceMap?(await remapCoverage({
        [path]: {
          path,
          branchMap,
          statementMap,
          fnMap,
          inputSourceMap,
          s,
          f,
          b
        }
      }).then(r=>{
        return Object.keys(r)[0]
      })):path;

      const endTime = process.hrtime(startTime);

      const elapsedTime = endTime[0] * 1000 + endTime[1] / 1000000;

      data.push({
        id: `__${buildProvider}__${buildID}__${provider}__${repoID}__${sha}__${path}__`,
        sha,
        repoID,
        buildProvider,
        buildID,
        path,
        instrumentCwd,
        provider,
        branchMap: JSON.stringify(branchMap),
        statementMap: JSON.stringify(statementMap),
        fnMap: JSON.stringify(fnMap),
        inputSourceMap: inputSourceMap ? JSON.stringify(inputSourceMap) : '',
        oldPath: oldPath,
        time: elapsedTime,
      });
    }

    return this.prisma.coverageMap.createMany({ data });
  }
}
