import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { decompressedData } from "src/utils/compress";
/*
 *  最终覆盖率服务，接收projectID, sha, reportID，filepath，返回覆盖率数据，
 * 第二个参数是hit，也可以外部传入hit生成覆盖率数据
 */

@Injectable()
export class CoverageFinalService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(
    {
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
    hit?: { [key: string]: object },
  ) {
    return this.prisma.coverage.findFirst({
      where:{
        projectID: projectID,
        sha: sha,
        // reportID: reportID,
        // filepath: filepath,
      }
    }).then(r=>{
      // console.log(r)
      if (r?.hit){
        return decompressedData(r?.hit)
      } else {
        return {}
      }
    })
  }
}
