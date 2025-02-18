import {Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service";
import {CoverageClientDto} from "../dto/coverage-client.dto";
import {compressedData} from "../helpers/compress";

@Injectable()
export class CoverageClientService {
  constructor(
    private prisma: PrismaService,
  ) { }

  async invoke({
                 projectID,
                 sha,
                 branch,
                  instrumentCwd,
               }:CoverageClientDto) {


    const hit = await compressedData({})

    return  this.prisma.utCoverage.create({
      data:{
        projectID,
        sha,
        branch: branch,
        statementsTotal: 0,
        statementsCovered: 0,
        branchesTotal: 0,
        branchesCovered: 0,
        functionsTotal: 0,
        functionsCovered: 0,
        linesTotal: 0,
        linesCovered: 0,
        newlinesTotal: 0,
        newlinesCovered: 0,
        summary: hit,
        hit:hit,
        instrumentCwd: instrumentCwd,
      }
    })
  }

}
