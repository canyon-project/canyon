import {PrismaService} from "../../prisma/prisma.service";
import {Injectable} from "@nestjs/common";
import {PrismaSqliteService} from "../../prisma/prisma-sqlite.service";

@Injectable()
export class CoverageMapForCommitService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaSqlite: PrismaSqliteService,
  ) {
  }
  async invoke(){
    await this.prisma.repo.findMany({
      where:{}
    })

    await this.prismaSqlite.coverageQueue.findMany({
      where:{}
    })
    return {}
  }
}
