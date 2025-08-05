# 多阶段构建 Dockerfile - 前端 + 后端

# 前端构建阶段
FROM node:24-alpine AS frontend-builder
WORKDIR /app
COPY packages/frontend/package.json ./packages/frontend/
COPY scripts ./scripts
COPY package.json pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install
COPY packages/frontend ./packages/frontend
WORKDIR /app/packages/frontend
RUN pnpm build

# 后端构建阶段
FROM golang:1.24-alpine AS backend-builder
RUN apk add --no-cache ca-certificates tzdata git
WORKDIR /app
COPY packages/backend/go.mod packages/backend/go.sum ./
RUN go mod download
COPY packages/backend .
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-w -s -extldflags '-static'" \
    -a -installsuffix cgo \
    -o main .

# 最终运行阶段
FROM alpine:3.19

# 安装必要的运行时依赖
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    && rm -rf /var/cache/apk/*

# 复制应用文件
COPY --from=frontend-builder /app/packages/frontend/dist /static
COPY --from=backend-builder /app/main /app/main

# 暴露端口
EXPOSE 8080

# 运行后端
CMD ["/app/main"]
