import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CodechangeService {
  constructor(private readonly prisma: PrismaService) {}

  async getCodechange(sha, filepath) {
    return this.prisma.codechange.findMany({
      where: {
        sha: sha,
        path: filepath,
      },
    });
  }
}
