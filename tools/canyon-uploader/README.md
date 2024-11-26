Canyon Uploader

## 使用

1. 安装依赖

```bash
npm install -g canyon-uploader
```

2. 使用

```bash
canyon-uploader hit --dsn=http://localhost:8080/coverage/map/client
```

or

map是支持playwright等自动化工具生成的覆盖率数据

```bash
canyon-uploader map --dsn=http://localhost:8080/coverage/client
```

canyon-uploader map --dsn=http://localhost:8080/coverage/client --project_id=1 --instrument_cwd=/Users/xxx/xxx --sha=0521a99225c799f2e62439a6c1f3c884fbdb65cc

./bin/canyon-uploader map --dsn=http://localhost:8080/coverage/map/client --project_id=1 --instrument_cwd=/Users/xxx/xxx --sha=8ae63737150959dd7a1517735e1069adb4a0b6fc

./bin/canyon-uploader hit --dsn=http://localhost:8080/coverage/client
