import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectModel } from '@nestjs/mongoose';
import { CoverageData } from '../../schemas/coverage-data.schema';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
// import { splitJSONIntoQuarters, validateObject } from '../../utils/coverage';
import { compressedData, decompressedData } from '../../../utils/zstd';
@Injectable()
export class CoverageDataAdapterService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectModel(CoverageData.name)
    private coverageDataModel: Model<CoverageData>,
  ) {}
  // crud
  // 1/4 格式化，防止空key
  async create(coverage, coverageID) {
    return this.coverageDataModel
      .create({
        coverage: await compressedData(JSON.stringify(coverage)),
        coverageID,
        v: '20240412',
        createdAt: new Date(),
      })
      .then((r) => String(r._id));
  }
  async update(relationID, coverage) {
    return this.coverageDataModel.updateOne(
      {
        _id: new mongoose.Types.ObjectId(relationID),
      },
      {
        coverage: await compressedData(JSON.stringify(coverage)),
        createdAt: new Date(),
      },
    );
  }
  retrieve(relationID) {
    return this.coverageDataModel
      .findOne({
        _id: new mongoose.Types.ObjectId(relationID),
      })
      .then((r) => decompressedData(r.coverage))
      .then((r) => JSON.parse(r));
  }
}
