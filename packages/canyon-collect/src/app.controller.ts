import { Controller, Get, Header, Param, Res } from "@nestjs/common";
import { AppService } from "./app.service";
import { Response } from "express";
import { PrismaService } from "./prisma/prisma.service";
// import prisma from "@/lib/prisma";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get("api/vi/health")
  getHello(): string {
    return this.appService.getHello();
  }

  @Get(":hash.sdk.js")
  @Header("Content-Type", "application/javascript")
  // @ResponseHeader("Cache-Control", "public, max-age=31536000, immutable")
  async canyonSDK(@Param("hash") hash: string, @Res() res: Response) {
    const { value } = await this.prisma.sysSetting.findFirst({
      where: {
        key: "SDK",
      },
    });
    //   返回js文件
    // return value;

    res.setHeader("Content-Type", "application/javascript");
    return res.send(
      value.replaceAll(
        `fd.append("projectID", projectID)`,
        `fd.append("projectID", "${hash}")`,
      ),
    );
  }
}
