import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import axios from "axios";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}
  async validateUser(username: string, password: string): Promise<any> {
    return (
      (await this.prisma.user.findFirst({
        where: {
          username,
          password,
        },
      })) || null
    );
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      id: user.id,
    };
    // AuthService.login 第三步：存储信息
    return {
      token: this.jwtService.sign(payload),
    };
  }

  async oauthToken(params) {
    const gitProvider = await this.prisma.gitProvider.findFirst({
      where: {
        disabled: false,
      },
    });
    // gitProvider.url()
    const { access_token: accessToken, refresh_token: refreshToken } =
      await axios
        .post(
          `${gitProvider?.url}/oauth/token?client_id=${gitProvider?.clientID}&client_secret=${gitProvider?.clientSecret}&code=${params.code}&grant_type=authorization_code&redirect_uri=${params.redirectUri}`,
        )
        .then((res) => {
          return res.data;
        })
        .catch(() => {
          // 如果没兑换到就抛异常
          throw new UnauthorizedException();
        });
    // 2.如果成功拿到token，先去gitlab那边校验一下，拿到用户信息
    const {
      username,
      name: nickname,
      avatar_url: avatar,
      email,
      id: id,
    } = await axios
      .get(`${gitProvider?.url}/api/v4/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        return res.data;
      });
    // 3.通过gitlab userId到db中查找
    const userFindDB = await this.prisma.user.findFirst({
      where: {
        id: Number(id),
      },
    });
    const user = {
      accessToken,
      refreshToken,
      username,
      nickname,
      avatar: avatar || "/default-avatar.png",
      email,
      password: "123456",
      favor: "",
      createdAt: new Date(),
    };

    if (userFindDB) {
      await this.prisma.user.update({
        where: { id: userFindDB.id },
        data: {
          accessToken,
          refreshToken,
        },
      });
    } else {
      await this.prisma.user.create({
        data: {
          id,
          ...user,
        },
      });
    }
    const isHasUser = await this.prisma.user.findFirst({
      where: { id: Number(id) },
    });
    return this.login({
      username: isHasUser.username,
      id: isHasUser.id,
    });
  }

  async passwordLogin(params) {
    const isHasUser = await this.prisma.user.findFirst({
      where: {
        username: params.username,
        password: params.password,
      },
    });
    if (!isHasUser) {
      throw new UnauthorizedException();
    }
    return this.login({
      username: isHasUser.username,
      id: isHasUser.id,
    });
  }
}
