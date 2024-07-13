import {Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service";
import {Timeout} from "@nestjs/schedule";
import {CoverageDataAdapterService} from "../coverage/services/common/coverage-data-adapter.service";

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
          gte: new Date('2024-07-12 00:00:00')
        }
      },
      select:{
        id:true,
        relationID:true,
        covType:true
      }
    });
    // 2.遍历coverage
    for (let i = 0; i < ids.length; i++) {

      const {relationID,id:coverageID} = ids[i]

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


        const fileMapTasks = Object.entries(coverage).map(
          async (coverageEntries) => {
            const [path, fileCoverage]: any = coverageEntries;
            await this.prisma.fileMap
              .create({
                data: {
                  id: `__${projectID}__${sha}__${path.replaceAll('~/','')}__`,
                  mapJson: JSON.stringify({
                    fnMap: fileCoverage.fnMap,
                    statementMap: fileCoverage.statementMap,
                    branchMap: fileCoverage.branchMap,
                  }),
                },
              })
              .then((res) => {
                return res;
              })
              .catch(() => {
                return true;
              });
          },
        );
        const time2 = new Date().getTime();
        await Promise.all(fileMapTasks);

        console.log('fileMapTasks', new Date().getTime() - time2);



        const time3 = new Date().getTime();
        const hitTasks = Object.entries(coverage).map(
          async (coverageEntries) => {
            const [path, fileCoverage]: any = coverageEntries;
            await this.prisma.hit
              .create({
                data: {
                  id: `__${ids[i].id}__${path.replaceAll('~/','')}__`,
                  hitJson: JSON.stringify({
                    f: fileCoverage.f,
                    b: fileCoverage.b,
                    s: fileCoverage.s,
                  }),
                },
              })
              .then((res) => {
                return res;
              })
              .catch((e) => {
                return true;
              });
          },
        );
        await Promise.all(hitTasks);
        console.log('hitTasks', new Date().getTime() - time3);
      }
    }
  }
}
