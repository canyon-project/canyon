import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../../../prisma/prisma.service";
import {parseProjectID, reorganizeCompleteCoverageObjects, resetCoverageDataMap} from "canyon-data";
import {convertDataFromCoverageMapDatabase, decompressedData, remapCoverageWithInstrumentCwd} from "canyon-map";
import {deserializeSMap} from "../../../../utils/s-map";


function genHitByMap(mapValue:any) {
  return {
    s: Object.entries(mapValue.statementMap).reduce((accInside, [keyInside]) => {
      // @ts-ignore
      accInside[keyInside] = 0;
      return accInside;
    }, {}),
    f: Object.entries(mapValue.fnMap).reduce((accInside, [keyInside]) => {
      // @ts-ignore
      accInside[keyInside] = 0;
      return accInside;
    }, {}),
    b: Object.entries(mapValue.branchMap).reduce(
      (accInside, [keyInside, valueInside]: any) => {
        // @ts-ignore
        accInside[keyInside] = Array(valueInside.length).fill(0);
        return accInside;
      },
      {},
    ),
  }
}

@Injectable()
export class RemapedHitService {
  constructor(private readonly prisma: PrismaService) {}

  async invoke (    {
                      projectID,
                      sha,
                      reportID,
                      filepath,
                    }: {
                      projectID: string;
                      sha: string;
                      reportID?: string;
                      filepath?: string;
                    },
                    hit: { [key: string]: object },codechanges){



    const { provider, repoID } = parseProjectID(projectID);


    const noNeedReMaps = await this.prisma.coverageMap.findMany({
      where:{
        provider,
        repoID,
        sha,
        containSourceMap: false,
      },select:{
        statementMap: true,
        path: true,
      }
    })


    const needReMaps = await this.prisma.coverageMap.findMany({
      where:{
        provider,
        repoID,
        sha,
        containSourceMap: true,
      }
    })




    let result = {}

    if (needReMaps.length > 0){
      const { map, instrumentCwd } =
        await convertDataFromCoverageMapDatabase(needReMaps);


      const reMapMap2 = await remapCoverageWithInstrumentCwd(
        resetCoverageDataMap(map),
        instrumentCwd,
      );
      const reMapMapMap = reorganizeCompleteCoverageObjects(reMapMap2, hit);


      result = reMapMapMap
    }


    const addsMaps = await this.prisma.coverageMap.findMany({
      where:{
        provider,
        repoID,
        sha,
        path:{
          in:codechanges.map((item)=>item.path)
        },
      }
    })


    for (let i = 0; i < noNeedReMaps.length; i++) {
      if (hit[noNeedReMaps[i].path]){
        result[noNeedReMaps[i].path] = {
          ...hit[noNeedReMaps[i].path],
          statementMap: deserializeSMap(noNeedReMaps[i].statementMap),
        }
      } else {
        // 跟最后一个一样
        result[noNeedReMaps[i].path] = {
          path: noNeedReMaps[i].path,
          ...genHitByMap(noNeedReMaps[i]),
          statementMap: deserializeSMap(noNeedReMaps[i].statementMap),
        }
      }
    }

    for (let i = 0; i < addsMaps.length; i++) {
      const m = await decompressedData(addsMaps[i].map)
      result[addsMaps[i].path] = {
        // @ts-ignore
        ...m,
        ...hit[addsMaps[i].path],
      }
    }


    return result
  }
}
