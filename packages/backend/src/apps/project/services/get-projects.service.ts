import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetProjectsService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(current, pageSize) {
    const u = await this.prisma.user.findMany({
      where: {},
    });
    console.log(u);
    return {
      data: [],
      total: 0,
    };
  }
}
