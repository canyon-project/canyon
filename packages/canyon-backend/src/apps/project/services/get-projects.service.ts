import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetProjectsService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(current, pageSize) {
    return {
      data: [],
      total: 0,
    };
  }
}
