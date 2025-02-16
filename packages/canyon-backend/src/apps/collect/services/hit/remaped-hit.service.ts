import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../../../prisma/prisma.service";
import {parseProjectID, reorganizeCompleteCoverageObjects, resetCoverageDataMap} from "canyon-data";
import {convertDataFromCoverageMapDatabase, remapCoverageWithInstrumentCwd} from "canyon-map";
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
                    hit: { [key: string]: object },){



    const { provider, repoID } = parseProjectID(projectID);


    const allNeedReMaps = await this.prisma.coverageMap.findMany({
      where:{
        provider,
        repoID,
        sha,
        // containSourceMap: false,
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


    // console.log(needReMaps,'needReMaps')



    const result = {}

    for (let i = 0; i < allNeedReMaps.length; i++) {
      if (needReMaps.length>0){

        const { map, instrumentCwd } =
          await convertDataFromCoverageMapDatabase(needReMaps);


        const reMapMap2 = await remapCoverageWithInstrumentCwd(
          resetCoverageDataMap(map),
          instrumentCwd,
        );
        const reMapMapMap = reorganizeCompleteCoverageObjects(reMapMap2, hit);

        if (result[allNeedReMaps[i].path]){
          result[allNeedReMaps[i].path] = reMapMapMap[allNeedReMaps[i].path]
        } else {
          // 跟最后一个一样
          result[allNeedReMaps[i].path] = {
            path: allNeedReMaps[i].path,
            ...genHitByMap(allNeedReMaps[i]),
            statementMap: deserializeSMap(allNeedReMaps[i].statementMap),
          }
        }


      } else if (hit[allNeedReMaps[i].path]){
        result[allNeedReMaps[i].path] = {
          ...hit[allNeedReMaps[i].path],
          statementMap: deserializeSMap(allNeedReMaps[i].statementMap),
        }
      } else {
        // 跟最后一个一样
        result[allNeedReMaps[i].path] = {
          path: allNeedReMaps[i].path,
          ...genHitByMap(allNeedReMaps[i]),
          statementMap: deserializeSMap(allNeedReMaps[i].statementMap),
        }
      }
    }

    return result
  }
}
