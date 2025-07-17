# 第一阶段：安装依赖和构建
FROM node:20-alpine AS builder

WORKDIR /app

# 复制根依赖文件
COPY package.json pnpm-workspace.yaml ./
COPY packages ./packages

# 安装 pnpm
RUN npm install -g pnpm

# 安装所有依赖
RUN pnpm install --frozen-lockfile

# 构建前端
WORKDIR /app/packages/frontend
RUN pnpm run build

# 构建后端（NestJS）
WORKDIR /app/packages/backend
RUN pnpm run build

# 第二阶段：生产环境，仅保留必要内容
FROM node:20-alpine AS runner

WORKDIR /app

# 只安装生产依赖
COPY package.json pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/
RUN npm install -g pnpm && pnpm install --prod --filter ./packages/backend

# 拷贝后端构建产物
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist

# 拷贝前端构建产物到后端 public 目录（假设为 public）
COPY --from=builder /app/packages/frontend/dist ./packages/backend/public

# 如有其他静态资源，也可一并拷贝

# 启动 NestJS 后端
WORKDIR /app/packages/backend
CMD ["node", "dist/main.js"]
