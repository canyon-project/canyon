import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
@Injectable()
export class PlaygroundService {
    constructor(private prisma: PrismaService) {}
}
