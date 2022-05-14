FROM zhangtao25/canyon-platform:v2.0.7 as FrontEnd

FROM node:14.16.0-alpine

MAINTAINER wr_zhang25

RUN mkdir -p /usr/src/app
COPY . /usr/src/app/
# 从编译阶段的中拷贝编译结果到当前镜像中
COPY --from=FrontEnd /usr/src/app/dist /usr/src/app/client/
WORKDIR /usr/src/app

RUN node -v
RUN npm install
RUN npm run build

EXPOSE 8080
CMD ["node", "dist/main.js" ]
