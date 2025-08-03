import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getFileInfo } from '../../adapter/gitlab.adapter';

@Injectable()
export class CodeService {
  constructor(private readonly prisma: PrismaService) {}
  async getCode(repoID, sha, filepath): Promise<any> {
    const gitProvider = await this.prisma.gitProvider.findFirst({
      where: {
        id: {
          in: ['tripgl'],
        },
      },
    });
    return getFileInfo(
      {
        repoID: repoID,
        filepath: encodeURIComponent(filepath),
        commitSha: sha,
      },
      gitProvider?.privateToken || '',
      gitProvider?.url || '',
    );
  }
}
