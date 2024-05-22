import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoverageTest } from '../schemas/coverage-test.schema';
import { decompressedData } from '../../utils/zstd';

@Injectable()
export class CoverageTestService {
  constructor(
    @InjectModel(CoverageTest.name)
    private coverageTestModel: Model<CoverageTest>,
  ) {}
  create({ projectID, sha, coverage }) {
    return this.coverageTestModel.create({ projectID, sha, coverage });
  }

  find({ projectID, sha }) {
    return this.coverageTestModel
      .findOne({ projectID, sha })
      .then((r) => {
        return decompressedData(r.coverage);
      })
      .then((r) => JSON.parse(r));
  }
}
