import {Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class CoverageMapService {
  constructor(
    private prisma: PrismaService,
  ) { }

  async invoke({
    projectID,
    sha,
    reportID,
               }) {
    const data = await this.prisma.utCoverage.findMany({
      where:{}
    });
    console.log(data);
    return {
      name:"coverage-map-service"
    }
  }

}
