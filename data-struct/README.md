# 采集 API 请求体（Mock）

与 `POST /coverage/map/init`、`POST /coverage/client` 解析逻辑一致（见 `services/api/src/lib/istanbul-coverage.ts`、`coverage-client-parse.ts`）。

| 文件 | 接口 |
| --- | --- |
| `map-init.mock.json` | `POST /coverage/map/init` |
| `coverage-client.mock.json` | `POST /coverage/client` |

两文件中的 `buildHash` 需保持一致；**先 init，再 client**。

本地试跑：

```bash
curl -sS -X POST "http://localhost:8080/coverage/map/init" \
  -H 'Content-Type: application/json' \
  --data-binary @data-struct/map-init.mock.json

curl -sS -X POST "http://localhost:8080/coverage/client" \
  -H 'Content-Type: application/json' \
  --data-binary @data-struct/coverage-client.mock.json
```
