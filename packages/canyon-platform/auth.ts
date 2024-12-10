import NextAuth from "next-auth";
import GitLab from "next-auth/providers/gitlab";
import GitHub from "next-auth/providers/github";
import prisma from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth } = NextAuth({
  // debug: true,
  // nginx 代理需要设置 trustHost
  trustHost: true,
  // redirectProxyUrl: "http://localhost:3000/api/auth",
  providers: [
    // 账号密码登录，用于测试
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(c) {
        const u = await prisma.user.findFirst({
          where: {
            email: c.email as string,
            password: c.password as string,
          },
        });
        if (!u) return null;
        return {
          id: u.id,
          name: u.nickname,
          email: u.email,
          image: u.avatar,
        };
      },
    }),
    process.env.AUTH_GITLAB_ORIGIN
      ? GitLab({
          authorization: `${process.env.AUTH_GITLAB_ORIGIN}/oauth/authorize?scope=read_user`,
          token: `${process.env.AUTH_GITLAB_ORIGIN}/oauth/token`,
          userinfo: `${process.env.AUTH_GITLAB_ORIGIN}/api/v4/user`,
        })
      : GitLab,
    GitHub,
  ],
  callbacks: {
    redirect: async () => {
      return "/projects";
    },
    // 登陆的时候从gitlab获取用户信息
    async signIn({ profile, account, user }) {
      // 对于账号密码登录，不需要数据库处理
      if (account?.provider === "credentials") {
        return true;
      }
      const userTest: any = {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
        username: profile?.username || profile?.login || "username",
        nickname: user.name,
        avatar: user.image || "/default-avatar.png",
        email: user.email,
        password: "123456",
        favor: "",
        createdAt: new Date(),
      };

      await prisma.user.upsert({
        where: {
          // @ts-ignore
          id: String(account.provider + "-" + profile.id),
        },
        update: {
          accessToken: "accessToken",
          refreshToken: "refreshToken",
        },
        create: {
          // @ts-ignore
          id: String(account.provider + "-" + profile.id),
          ...userTest,
        },
      });
      return true;
    },
    jwt({ token, user, profile, account }) {
      if (user) {
        token.id = profile
          ? String(account?.provider + "-" + profile.id)
          : user.id;
      }
      return token;
    },
    session({ session, token }) {
      // @ts-ignore
      session.user.id = token.id;
      return session;
    },
  },
});
