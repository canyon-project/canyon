import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RepoService {
  constructor(private readonly prisma: PrismaService) {}
  async getHello() {
    const s = await this.prisma.user.findMany({
      where: {
        nickname: 's',
      },
    });
    return {
      id: '1',
      userUid: s.length + '',
    };
  }
}
