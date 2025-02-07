import {Injectable} from "@nestjs/common";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {CoverageUtEntity} from "../entity/coverage-ut.entity";

@Injectable()
export class CoverageMapService {
  constructor(@InjectRepository(CoverageUtEntity) private readonly repo: Repository<CoverageUtEntity>) { }

  async invoke({
    projectID,
    sha,
    reportID,
               }) {
    const data = await this.repo.find();
    console.log(data);
    return {
      name:"coverage-map-service"
    }
  }

}
