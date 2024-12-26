import { Controller, Get, Header, Param, Res } from "@nestjs/common";

import { Response } from "express";
import { PrismaService } from "./prisma/prisma.service";

@Controller()
export class AppController {
    constructor(private readonly prisma: PrismaService) {}

    @Get("api/vi/health")
    getHello(): string {
        return "Hello World!";
    }

    @Get(":hash.sdk.js")
    @Header("Content-Type", "application/javascript")
    async canyonSDK(@Param("hash") hash: string, @Res() res: Response) {
        const { value } = await this.prisma.sysSetting.findFirst({
            where: {
                key: "SDK",
            },
        });

        res.setHeader("Content-Type", "application/javascript");
        return res.send(
            value.replaceAll(
                `fd.append("projectID", projectID)`,
                `fd.append("projectID", "${hash}")`,
            ),
        );
    }
}
