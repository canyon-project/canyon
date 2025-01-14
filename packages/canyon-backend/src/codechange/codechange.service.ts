import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CodechangeService {
  constructor(private readonly prisma: PrismaService) {}

  async getCodechange(sha, filepath) {
    const { compareTarget } = await this.prisma.coverage
      .findFirst({
        where: {
          sha: sha,
          covType: "all",
          projectID: {
            not: {
              contains: "-ut",
            },
          },
        },
      })
      .then((res) => res || { compareTarget: sha });
    return this.prisma.codechange
      .findFirst({
        where: {
          compareTarget,
          sha: sha,
          path: filepath,
        },
      })
      .then((r) => {
        if (r) {
          return r;
        } else {
          return {
            id: "",
            projectID: "",
            compareTarget: compareTarget,
            sha: sha,
            path: filepath,
            additions: [],
            deletions: [],
          };
        }
      });
  }
}
