import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import axios from "axios";
import { PrismaService } from "../prisma/prisma.service";
import { convertSystemSettingsFromTheDatabase } from "../utils/sys";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {
    this.prisma.user.upsert({
      where: {
        id: "1",
      },
      update: {},
      create: {
        id: "1",
        // username: "canyon",
        password: "123456",
        nickname: "canyon",
        email: "canyon@canyon.com",
        avatar: "/default-avatar.png",
        favor: "",
        createdAt: new Date(),
        // accessToken: "",
        // refreshToken: "",
      },
    });
  }
  async validateUser(username: string, password: string): Promise<any> {
    return (
      (await this.prisma.user.findFirst({
        where: {
          email: username,
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
    const { gitlabServer, gitlabClientID, gitlabClientSecret } =
      await this.prisma.sysSetting
        .findMany({})
        .then((res) => convertSystemSettingsFromTheDatabase(res));
    const { access_token: accessToken, refresh_token: refreshToken } =
      await axios
        .post(`${gitlabServer}/oauth/token`, undefined, {
          params: {
            client_id: gitlabClientID,
            client_secret: gitlabClientSecret,
            code: params.code,
            grant_type: "authorization_code",
            redirect_uri: params.redirectUri,
          },
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
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
      .get(`${gitlabServer}/api/v4/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        return res.data;
      });
    // 3.通过gitlab userId到db中查找
    const user = {
      // accessToken,
      // refreshToken,
      // username,
      nickname,
      avatar: avatar || "/default-avatar.png",
      email,
      password: "123456",
      favor: "",
      createdAt: new Date(),
    };

    const userFindDB = await this.prisma.user.upsert({
      where: {
        id: String(id),
      },
      update: {
        // accessToken,
        // refreshToken,
      },
      create: {
        id: String(id),
        ...user,
      },
    });

    return this.login({
      username: user.email,
      id: userFindDB.id,
    });
  }

  async passwordLogin(params) {
    const isHasUser = await this.prisma.user.findFirst({
      where: {
        email: params.username,
        password: params.password,
      },
    });
    if (!isHasUser) {
      throw new UnauthorizedException();
    }
    return this.login({
      username: isHasUser.email,
      id: isHasUser.id,
    });
  }
}
