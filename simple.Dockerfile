FROM node:lts

MAINTAINER wr_zhang25

RUN mkdir -p /app
COPY . /app/
WORKDIR /app

RUN npm install pnpm@9 -g
RUN pnpm i
RUN pnpm run build

EXPOSE 8080
CMD ["node", "packages/canyon-simple/dist/main.js" ]
