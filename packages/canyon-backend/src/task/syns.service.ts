import {Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service";
import {Timeout} from "@nestjs/schedule";
import {CoverageDataAdapterService} from "../coverage/services/common/coverage-data-adapter.service";
import * as fs from "node:fs";
import {compressedData} from "../utils/zstd";

@Injectable()
export class SynsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coverageDataAdapterService: CoverageDataAdapterService,
  ) {
  }

  @Timeout(1)
  async mainTask() {
    // 1.查出07-12 12:00以前的coverage数据
    const ids = await this.prisma.coverage.findMany({
      where:{
        projectID:{
          not:{
            contains:'-ut'
          }
        },
        updatedAt: {
          lt: new Date('2024-07-12 12:00:00'),
          // gte: new Date('2024-07-12 00:00:00')
        }
      },
      select:{
        id:true,
        relationID:true,
        covType:true
      }
    });
    console.log(ids.length)
    // 2.遍历coverage
    for (let i = 0; i < ids.length; i++) {
      console.log('ids',ids[i].id,i,ids.length)
      const {relationID,id:coverageID} = ids[i]

      if (relationID){
        const coverageData = await this.coverageDataAdapterService.retrieve(relationID).catch(err=>{
          return null
        })
        if (coverageData){

          //   ******
          //   ******
          //   ******
          //   ******
          //   ******
          //   ******

          const coverageClientDto = await this.prisma.coverage.findFirst({
            where:{
              id: coverageID
            }
          })

          const { sha, projectID, reportID, branch,compareTarget,reporter } =
            coverageClientDto;

          const coverage = coverageData;

          if (JSON.stringify(coverage)!=='{}'){






            const zstd = await compressedData(JSON.stringify(Object.entries(coverage).reduce((previousValue, currentValue:any)=>{
              previousValue[currentValue[0]] = {
                fnMap: currentValue[1].fnMap,
                branchMap: currentValue[1].branchMap,
                statementMap: currentValue[1].statementMap,
              }
              return previousValue
            },{})))

            await this.prisma.covMap
              .create({
                data: {
                  id: `__${projectID}__${sha}__`,
                  mapJsonStrZstd: zstd,
                },
              })
              .then((res) => {
                return res;
              })
              .catch(() => {
                return true;
              });





            const time3 = new Date().getTime();


            await this.prisma.covHit
              .create({
                data: {
                  id: `__${ids[i].id}__`,
                  mapJsonStr: JSON.stringify(Object.entries(coverage).reduce((previousValue, currentValue:any)=>{
                    previousValue[currentValue[0]] = {
                      f: currentValue[1].f,
                      b: currentValue[1].b,
                      s: currentValue[1].s,
                    }
                    return previousValue
                  },{})),
                },
              })
              .then((res) => {
                return res;
              })
              .catch((e) => {
                return true;
              });


            console.log('hitTasks', new Date().getTime() - time3);



          } else {
            console.log('coverage is ',JSON.stringify(coverage))
          }

        }
      } else {
        console.log('relationID is null')
      }
    }
  }
}
