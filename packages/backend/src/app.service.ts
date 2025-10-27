import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}
  async getHello() {
    const s = await this.prisma.user.findMany({
      where: {
        nickname: 's',
      },
    });
    console.log(s, 's');
    return 'Hello World!';
  }
}
