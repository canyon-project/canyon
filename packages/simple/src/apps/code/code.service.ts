import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { getFileInfo } from '../adapter/gitlab.adapter';
// import { PrismaService } from '../../prisma/prisma.service';
import { getGitHubFileInfo } from '../../adapter/github.adapter';
import { InjectRepository } from '@nestjs/typeorm';
import { SimpleCoverage } from '../coverage/entities/simple-coverage.entity';
import { Repository } from 'typeorm';
import { SimpleGitProvider } from './entities/simple-git-provider.entity';

@Injectable()
export class CodeService {
  constructor(
    @InjectRepository(SimpleGitProvider)
    private simpleGitProviderRepository: Repository<SimpleGitProvider>,
  ) {}
  async getsourcecode(repoID, sha, filepath): Promise<any> {
    const gitProvider = await this.simpleGitProviderRepository.findOne({
      where: {},
    });
    return getGitHubFileInfo(
      {
        projectID: (repoID),
        filepath: (filepath),
        commitSha: sha,
      },
      gitProvider?.privateToken || '',
      // gitProvider?.url || '',
    );
  }
}
