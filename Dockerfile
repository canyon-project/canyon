FROM oven/bun:latest

WORKDIR /app

# Install nodejs using n
ARG NODE_VERSION=20
RUN apt update \
    && apt install -y curl
RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n \
    && bash n $NODE_VERSION \
    && rm n \
    && npm install -g n

COPY . .

RUN bun install

WORKDIR /app/packages/canyon-backend
RUN bunx prisma generate

# 暴露应用运行的端口（假设应用在3000端口运行）
EXPOSE 8080
CMD ["bun", "./src/main.ts"]
