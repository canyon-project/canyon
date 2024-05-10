import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoveragediskEntity } from '../../entity/coveragedisk.entity';
import { Repository } from 'typeorm';
import { mergeCoverageMap } from '@canyon/data';

@Injectable()
export class CoveragediskService {
  constructor(
    @InjectRepository(CoveragediskEntity)
    private readonly coveragediskRepository: Repository<CoveragediskEntity>,
  ) {}
  async pushQueue(data) {
    return this.coveragediskRepository.insert({
      pid: String(process.pid),
      projectID: data.projectID,
      sha: data.sha,
      reportID: data.reportID,
      data: JSON.stringify(data),
      createdAt: new Date(),
    });
  }
  async getQueueWithSameShaAndProjectID() {
    const old = await this.coveragediskRepository.findOne({
      where: {
        pid: String(process.pid),
      },
      order: {
        createdAt: 'ASC',
      },
      select: {
        pid: true,
        projectID: true,
        sha: true,
        data: true,
        reportID: true,
      },
    });
    if (!old) {
      return false;
    }
    const coveragedisks = await this.coveragediskRepository.find({
      where: {
        projectID: old.projectID,
        sha: old.sha,
        pid: String(process.pid),
        reportID: old.reportID,
      },
      select: {
        id: true,
      },
    });
    let cov = {};
    for (let i = 0; i < coveragedisks.length; i++) {
      const toBeConsumedQueues = await this.coveragediskRepository.findOne({
        where: { id: coveragedisks[i].id, pid: String(process.pid) },
      });
      //   聚合
      cov = mergeCoverageMap(cov, JSON.parse(toBeConsumedQueues.data).coverage);
      await this.coveragediskRepository.delete({ id: coveragedisks[i].id });
    }
    return {
      ...JSON.parse(old.data),
      coverage: cov,
    };
  }
}
