import {Injectable} from "@nestjs/common";
import {decompressedData} from "canyon-map";
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class CoverageSummaryMapService {
  constructor(
    private prisma: PrismaService,
  ) { }

  async invoke({
                 projectID,
                 sha,
                 // reportID,
               }) {
    const data = await this.prisma.utCoverage.findFirst({
      where:{
        // projectID,
        // sha,
      }
    });
    // console.log(data);
    const res = (await decompressedData(data.summary))

    return res
  }

}
