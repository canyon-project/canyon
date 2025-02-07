import {Injectable} from "@nestjs/common";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {CoverageUtEntity} from "../entity/coverage-ut.entity";
import {decompressedData} from "canyon-map";

@Injectable()
export class CoverageSummaryMapService {
  constructor(@InjectRepository(CoverageUtEntity) private readonly repo: Repository<CoverageUtEntity>) { }

  async invoke({
                 projectID,
                 sha,
                 // reportID,
               }) {
    const data = await this.repo.findOne({
      where:{
        projectID,
        sha,
      }
    });
    // console.log(data);

    // @ts-ignore
    const res = (await decompressedData(data.summary))

    return res
  }

}
