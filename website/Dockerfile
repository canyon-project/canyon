FROM node:lts

MAINTAINER wr_zhang25

RUN mkdir -p /app
COPY . /app/
WORKDIR /app

RUN npm install
RUN npm run build

EXPOSE 8080
CMD ["node", "server.js" ]
