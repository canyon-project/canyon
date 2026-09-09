# @canyonjs/mcp

Canyon 的 MCP（Model Context Protocol）服务端，供 Cursor / Claude 等 AI 工具查询覆盖率。

## 环境变量

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `CANYON_URL` | Canyon API 地址（不含尾部 `/`） | `http://127.0.0.1:3000` |
| `CANYON_TOKEN` | 可选 Bearer Token | 无 |

## 提供的 Tools

| Tool | 作用 |
| --- | --- |
| `list_repos` | 列出已接入仓库 |
| `list_compares` | 列出 compare 记录 |
| `list_snapshots` | 列出覆盖率快照 |

还提供一个 Prompt：`review_compare_coverage`。

## 本地开发

```bash
cd tools/mcp
pnpm install
pnpm build
pnpm start
```

## 在 Cursor 里接入

项目根目录 `.cursor/mcp.json` 或 Cursor Settings → MCP：

```json
{
  "mcpServers": {
    "canyon": {
      "command": "node",
      "args": ["/绝对路径/canyon/tools/mcp/bin/canyon-mcp.js"],
      "env": {
        "CANYON_URL": "http://127.0.0.1:3000"
      }
    }
  }
}
```

monorepo 内也可先用 workspace 包：

```json
{
  "mcpServers": {
    "canyon": {
      "command": "pnpm",
      "args": ["--dir", "tools/mcp", "start"],
      "env": {
        "CANYON_URL": "http://127.0.0.1:3000"
      }
    }
  }
}
```

## 示例对话

- 「列出 Canyon 里接入的仓库」
- 「列出这个仓库的覆盖率快照」
- 「compare subjectID 是 xxx 有哪些快照？」

## 架构说明

MCP 进程通过 HTTP 调用现有 Canyon REST API（`/api/coverage/*`、`/api/source/diff`、`/api/repos`），不直接连数据库。业务逻辑仍由主应用负责，MCP 只做摘要化输出，避免把完整 Istanbul map 塞进模型上下文。
