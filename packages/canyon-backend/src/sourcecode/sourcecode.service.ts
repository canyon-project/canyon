import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getFileInfo } from '../adapter/gitlab.adapter';

@Injectable()
export class SourcecodeService {
  constructor(private readonly prisma: PrismaService) {}

  getsourcecode(projectID, sha, filepath): Promise<any> {
    return getFileInfo(
      {
        projectID: projectID.split('-')[1],
        filepath: encodeURIComponent(filepath.replace('~/', '')),
        commitSha: sha,
      },
      'accessToken',
    );
  }
}
