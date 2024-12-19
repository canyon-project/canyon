import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { convertSystemSettingsFromTheDatabase } from "./utils/sys";

@Controller()
export class AppController {
    constructor(private readonly prisma: PrismaService) {}
    @Get("/api/vi/health")
    async viHealth() {
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
        const { gitlabServer, gitlabClientID, docsLink, canyonServer } =
            await this.prisma.sysSetting
                .findMany({})
                .then((res) => convertSystemSettingsFromTheDatabase(res));
        return {
            SYSTEM_QUESTION_LINK: docsLink,
            GITLAB_URL: gitlabServer,
            GITLAB_CLIENT_ID: gitlabClientID,
            CANYON_SERVER: canyonServer,
        };
    }
}
