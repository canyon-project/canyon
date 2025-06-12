import { PrismaService } from '../../../prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RepoService {
  constructor(private readonly prisma: PrismaService) {}
  async getByRepoId(repoID: string) {
    if (repoID.includes('/')) {
      return this.prisma.project.findFirst({
        where: { pathWithNamespace: repoID },
      });
    } else {
      return this.prisma.project.findFirst({
        where: { id: repoID },
      });
    }
  }
}
