import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getFileInfo } from '../adapter/gitlab.adapter';

@Injectable()
export class SourcecodeService {
  constructor(private readonly prisma: PrismaService) {}

  getsourcecode(projectID, sha, filepath): Promise<any> {
    // 实在不想硬编码
    if (projectID === '100807') {
      return getFileInfo(
        {
          projectID,
          filepath: encodeURIComponent(
            filepath.replace('~/src/taro/pages/tnt', 'src/pages/tnt'),
          ),
          commitSha: sha,
        },
        'accessToken',
      );
    } else {
      return getFileInfo(
        {
          projectID,
          filepath: encodeURIComponent(filepath.replace('~/', '')),
          commitSha: sha,
        },
        'accessToken',
      );
    }
  }
}
