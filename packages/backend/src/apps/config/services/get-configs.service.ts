import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
// import { PrismaService } from '../../../prisma.service';

@Injectable()
export class GetConfigsService {
  constructor(private prisma: PrismaService) {}

  async execute() {
    return this.prisma.config.findMany({
      where: {
        key: 'global',
      },
    });
  }
}
