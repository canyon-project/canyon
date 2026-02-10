import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserGetCurrentUserService } from './services/user-get-current-user.service';

@Module({
  controllers: [UserController],
  providers: [UserGetCurrentUserService],
  exports: [UserGetCurrentUserService],
})
export class UserModule {}
