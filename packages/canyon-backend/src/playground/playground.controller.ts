import { Controller } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller()
export class PlaygroundController {
    constructor(private readonly prismaService: PrismaService) {
        console.log("PlaygroundController created");
    }
}
