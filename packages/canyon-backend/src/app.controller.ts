import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}
  @Get("vi/health")
  async viHealth() {
    // const ids = await this.prisma.project.findMany({
    //   where: {},
    //   select: {
    //     id: true,
    //   },
    // });
    //
    // for (let i = 0; i < ids.length; i++) {
    //   const res = await this.prisma.project.update({
    //     where: {
    //       id: ids[i].id,
    //     },
    //     data: {
    //       members: [],
    //     },
    //   });
    //
    //   console.log(res);
    // }

    return "230614";
  }

  @Get("/api/gitprovider")
  gitprovider() {
    return this.prisma.gitProvider.findMany({
      where: {},
    });
  }

  @Get("/api/base")
  async base() {
    return {
      SYSTEM_QUESTION_LINK: process.env.SYSTEM_QUESTION_LINK,
      GITLAB_URL: process.env.GITLAB_URL,
      GITLAB_CLIENT_ID: process.env.GITLAB_CLIENT_ID,
    };
  }
}
