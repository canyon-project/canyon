import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from './user.model';
import { User as DbUser } from '@prisma/client';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  /**
   * 将 prisma 用户对象转换为用户对象
   *
   * @param dbUser Prisma User object
   * @returns  User object
   */
  convertDbUserToUser(dbUser: DbUser): Promise<User> {
    return this.prisma.user.findFirst({
      where: {
        id: Number(dbUser.id),
      },
    });
  }
}
