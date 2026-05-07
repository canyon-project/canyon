import { z } from "@hono/zod-openapi";

/** Repo 响应 schema，前后端共享 */
export const RepoSchema = z
  .object({
    id: z.string(),
    provider: z.string(),
    pathWithNamespace: z.string(),
    description: z.string(),
    config: z.string(),
    creator: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    reportTimes: z.number().optional(),
    lastReportTime: z.string().datetime().nullable().optional(),
    repoUrl: z.string().url().nullable().optional(),
  })
  .openapi("Repo");

/** 创建 Repo 请求 schema：必传 provider、repoID，其余通过 SCM 接口获取 */
export const CreateRepoSchema = z
  .object({
    provider: z.string().min(1).openapi({ example: "gitlab" }),
    repoID: z.string().min(1).openapi({ example: "118075" }),
    config: z.string().optional().default(""),
  })
  .openapi("CreateRepo");

/** 更新 Repo 请求 schema */
export const UpdateRepoSchema = z
  .object({
    description: z.string().optional(),
    config: z.string().optional(),
  })
  .openapi("UpdateRepo");

export const RepoMemberRoleSchema = z.enum(["admin", "developer"]).openapi("RepoMemberRole");

export const RepoMemberSchema = z
  .object({
    id: z.string(),
    repoID: z.string(),
    provider: z.string(),
    userID: z.string(),
    userName: z.string().nullable().optional(),
    userEmail: z.string().nullable().optional(),
    userImage: z.string().nullable().optional(),
    role: RepoMemberRoleSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("RepoMember");

export const CreateRepoMemberSchema = z
  .object({
    userID: z.string().min(1),
    role: RepoMemberRoleSchema.default("developer"),
  })
  .openapi("CreateRepoMember");

export const UpdateRepoMemberSchema = z
  .object({
    userID: z.string().min(1).optional(),
    role: RepoMemberRoleSchema.optional(),
  })
  .refine((data) => data.userID !== undefined || data.role !== undefined, {
    message: "至少提供一个更新字段",
  })
  .openapi("UpdateRepoMember");

/** 从 schema 推导的 TypeScript 类型 */
export type Repo = z.infer<typeof RepoSchema>;
export type CreateRepoInput = z.infer<typeof CreateRepoSchema>;
export type UpdateRepoInput = z.infer<typeof UpdateRepoSchema>;
export type RepoMember = z.infer<typeof RepoMemberSchema>;
export type RepoMemberRole = z.infer<typeof RepoMemberRoleSchema>;
export type CreateRepoMemberInput = z.infer<typeof CreateRepoMemberSchema>;
export type UpdateRepoMemberInput = z.infer<typeof UpdateRepoMemberSchema>;
