import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { getFileInfo } from '../adapter/gitlab.adapter';
import { PrismaService } from '../../prisma/prisma.service';
import { getFileInfo } from '../../adapter/gitlab.adapter';

@Injectable()
export class SourcecodeService {
  constructor(private readonly prisma: PrismaService) {}
  async getsourcecode(repoID, sha, filepath): Promise<any> {
    const gitProvider = await this.prisma.gitProvider.findFirst({
      where: {
        id: 'gitea',
      },
    });

    // console.log(gitProvider, repoID, filepath, sha);
    return getFileInfo(
      {
        projectID: repoID,
        filepath: encodeURIComponent(filepath),
        commitSha: sha,
      },
      gitProvider?.privateToken || '',
      gitProvider?.url || '',
    );
  }
}
