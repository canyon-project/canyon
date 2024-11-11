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
