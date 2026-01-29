## 安装

docker 快捷安装

docker run -d -p 8080:8080 -v /your/path/.env:/app/.env zhangtao25/canyon:main

nodejs 安装

git clone https://github.com/canyon-project/canyon

## 生成数据库创建脚本

npm run migrate:sql => schema.sql


插入 canyon_next_infra_config 数据，注意自己的GITLAB_PRIVATE_TOKEN

packages/backend/prisma/import-infra.sql

## gitlab部署查看

https://gitlab.com/canyon-project/canyon-demo 例子