import { createRoute, z } from "@hono/zod-openapi";
import { OpenAPIHono } from "@hono/zod-openapi";

const GUEST_USER = {
  username: "guest",
  nickname: "游客",
  email: "guest@trip.com",
  avatar: "",
};

const userGetRoute = createRoute({
  method: "get",
  path: "/",
  summary: "获取当前用户信息",
  description: "返回游客用户信息（无真实鉴权）",
  tags: ["用户"],
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            username: z.string(),
            nickname: z.string(),
            email: z.string(),
            avatar: z.string(),
          }),
        },
      },
      description: "用户信息",
    },
  },
});

const userApi = new OpenAPIHono();

userApi.openapi(userGetRoute, async (c) => {
  return c.json(GUEST_USER);
});

export default userApi;
