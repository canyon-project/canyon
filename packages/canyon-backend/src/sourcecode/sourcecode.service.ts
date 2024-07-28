import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { getFileInfo } from "../adapter/gitlab.adapter";

@Injectable()
export class SourcecodeService {
  constructor(private readonly prisma: PrismaService) {}

  async getsourcecode(projectID, sha, filepath, mode): Promise<any> {
    // 如果是模糊查询，就从发filepath里检索
    if (mode === "blurred") {
      filepath = await this.prisma.filepath
        .findMany({
          where: {
            projectID: projectID,
            sha: sha,
            path: {
              contains: filepath.replace("~/", ""),
            },
          },
        })
        .then((res) =>
          res.length > 0 ? res[0].path : filepath.replace("~/", ""),
        );
    }
    return getFileInfo(
      {
        projectID: projectID.split("-")[1],
        filepath: encodeURIComponent(filepath.replace("~/", "")),
        commitSha: sha,
      },
      "accessToken",
    );
  }
}
