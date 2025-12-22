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
    const r1= await this.prisma.repo.findMany({
      where:{}
    })

    const r2 = await this.prismaSqlite.coverageQueue.create({
      data:{
        payload:{},
        status:'PENDING',
        retry:1,
        createdAt:new Date()
        // status    QueueStatus @default(PENDING)
        // retry     Int         @default(0)
      }
    })

    const r3 = await this.prismaSqlite.coverageQueue.findMany({
      where:{}
    })
    return {
      r1,
      r2,
      r3
    }
  }
}
