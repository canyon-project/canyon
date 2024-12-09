import NextAuth from "next-auth";
import GitLab from "next-auth/providers/gitlab";
import GitHub from "next-auth/providers/github";
import prisma from "@/lib/prisma";
console.log(process.env.AUTH_SECRET, "process.env.AUTH_SECRET");
export const { handlers, auth } = NextAuth({
  providers: [
    GitLab({
      // authorization: "https://git.com/oauth/authorize?scope=read_user",
      // token: "https://git.com/oauth/token",
      // userinfo: "https://git.com/api/v4/user",
    }),
    GitHub,
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    redirect: async () => {
      return "/projects";
    },
    // 登陆的时候从gitlab获取用户信息
    async signIn({ profile, account, user }) {
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
        // @ts-ignore
        token.id = String(account.provider + "-" + profile.id);
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
