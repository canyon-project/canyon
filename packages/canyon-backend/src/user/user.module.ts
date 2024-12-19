import { Module } from "@nestjs/common";
import { UserResolver } from "./user.resolver";
import { UserService } from "./user.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { UserController } from "./user.controller";
import { ListUserService } from "./crud/list-user.service";

@Module({
    imports: [PrismaModule],
    controllers: [UserController],
    providers: [UserResolver, UserService, ListUserService],
    exports: [UserService],
})
export class UserModule {}
