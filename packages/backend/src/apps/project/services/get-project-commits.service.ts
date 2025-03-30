import { Injectable } from '@nestjs/common';
import {CommitModel, GetProjectCommitsResponseModel} from '../models/response/get-project-commits.response.model';
import {PrismaService} from "../../../prisma/prisma.service";

@Injectable()
export class GetProjectCommitsService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(
    projectID: string,
    branch: string | undefined,
    current: number,
    pageSize: number,
  ): Promise<GetProjectCommitsResponseModel> {


    // console.log(projectID, branch, current, pageSize);

    const coverages = await this.prisma.coverage.findMany({
      where:{
        projectID: 'gitlab-479811',
      },
      select:{
        id:true,
        projectID:true,
        branch:true,
        sha:true,
        // coverage:true,
        createdAt:true,
        updatedAt:true,
      }
    })


    console.log(coverages.length);


    // Group coverages by sha and collect branches for each sha
    const commitMap = new Map<string, { branches: string[] }>();
    coverages.forEach(coverage => {
      if (!commitMap.has(coverage.sha)) {
        commitMap.set(coverage.sha, { branches: [] });
      }
      commitMap.get(coverage.sha)!.branches.push(coverage.branch);
    });

    // Convert map to array of commits
    const commits: CommitModel[] = Array.from(commitMap.entries()).map(([sha, data]) => ({
      sha,
      commitMessage: 'Commit message', // TODO: Get actual commit message
      commitCreatedAt: new Date(), // TODO: Get actual commit time
      branches: data.branches,
      coverage: 0 // TODO: Calculate actual coverage
    }));


    return {
      data: commits,
      total: 0
    };
  }
}
