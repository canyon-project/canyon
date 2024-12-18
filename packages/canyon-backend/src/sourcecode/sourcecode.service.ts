import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { getFileInfo } from "../adapter/gitlab.adapter";

@Injectable()
export class SourcecodeService {
  constructor(private readonly prisma: PrismaService) {}
  async getsourcecode(projectID, sha, filepath): Promise<any> {
    const gitProvider = await this.prisma.gitProvider.findFirst({
      where: {
        id: projectID.split("-")[0],
      },
    });
    return getFileInfo(
      {
        projectID: projectID.split("-")[1],
        filepath: encodeURIComponent(filepath),
        commitSha: sha,
      },
      gitProvider?.privateToken,
      gitProvider?.url,
    );
  }
}
