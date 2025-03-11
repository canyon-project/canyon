import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UpdateUserSettingsService } from './services/update-user-settings.service';
import {PrismaModule} from "../../prisma/prisma.module";
import {UserService} from "./user.service";

@Module({
  imports: [PrismaModule],
  providers: [UserResolver, UpdateUserSettingsService,UserService],
})
export class UserModule {}
