import { Controller, Get } from "@nestjs/common";
// import { PrismaService } from "./prisma/prisma.service";
// import { convertSystemSettingsFromTheDatabase } from "./utils/sys";

@Controller()
export class AppController {
  // constructor(private readonly prisma: PrismaService) {}
  @Get("api/vi/health")
  async viHealth() {
    return "230614"
  }
  @Get("vi/health")
  async viHealth2() {
    return "230614";
  }
}
