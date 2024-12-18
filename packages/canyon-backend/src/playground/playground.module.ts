import { Module } from "@nestjs/common";
import { PlaygroundService } from "./playground.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { PlaygroundController } from "./playground.controller";

@Module({
  imports: [PrismaModule],
  controllers: [PlaygroundController],
  providers: [PlaygroundService],
  exports: [PlaygroundService],
})
export class PlaygroundModule {}
