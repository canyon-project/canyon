import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ListUserService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke() {
    return this.prisma.user.findMany({
      where: {},
    });
  }
}
