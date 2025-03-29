import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetCoveragesService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(current: number, pageSize: number) {
    const coverages = await this.prisma.coverage.findMany({
      skip: (current - 1) * pageSize,
      take: pageSize,
    });

    const total = await this.prisma.coverage.count();

    return {
      data: coverages.map((coverage) => ({
        id: coverage.id,
        name: 'coverage.projectID',
        description: 'coverage.description',
        createdAt: coverage.createdAt,
        updatedAt: coverage.updatedAt,
      })),
      total,
    };
  }
}
