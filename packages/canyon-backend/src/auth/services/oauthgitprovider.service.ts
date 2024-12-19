import { Injectable } from "@nestjs/common";
// import {JwtService} from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class OauthgitproviderService {
    constructor(
        // private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) {}
    invoke(params) {
        return {};
    }
}
