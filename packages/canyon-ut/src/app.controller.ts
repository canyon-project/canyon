import { Controller, Get } from "@nestjs/common";
import {CoverageMapService} from "./services/coverage-map.service";
// import { PrismaService } from "./prisma/prisma.service";
// import { convertSystemSettingsFromTheDatabase } from "./utils/sys";

@Controller()
export class AppController {
  constructor(private readonly coverageMapService: CoverageMapService) {}
  @Get("api/coverage/map")
  async viHealth() {
    return this.coverageMapService.invoke();
  }
  @Get("vi/health")
  async viHealth2() {
    return "230614";
  }
}
