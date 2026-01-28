# Canyon GitHub Action

将代码覆盖率报告上传到 Canyon 的 GitHub Action。

## 功能特性

- 📊 支持上传单个或多个覆盖率 JSON 文件
- 🔐 支持可选的认证 token
- 🎯 自动从 GitHub Actions 环境变量获取仓库和提交信息
- 📝 支持自定义场景信息（scene）
- ⚙️ 灵活的配置选项

## 使用方法

### 基本用法

```yaml
name: Upload Coverage

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run tests with coverage
        run: npm test -- --coverage
      
      - name: Upload coverage to Canyon
        uses: canyon-project/canyon-action@v1
        with:
          coverage-file: coverage/coverage-final.json
          canyon-url: https://your-canyon-server.com
          instrument-cwd: ${{ github.workspace }}
```

### 高级用法

```yaml
- name: Upload coverage to Canyon
  uses: canyon-project/canyon-action@v1
  with:
    # 支持多个文件，用逗号分隔
    coverage-file: coverage/coverage-final.json,coverage/coverage-summary.json
    canyon-url: https://your-canyon-server.com
    canyon-token: ${{ secrets.CANYON_TOKEN }}
    instrument-cwd: ${{ github.workspace }}
    build-target: production
    scene: |
      {
        "source": "automation",
        "type": "e2e",
        "env": "staging"
      }
    fail-on-error: true
```

## 输入参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `coverage-file` | ✅ | 覆盖率 JSON 文件路径，支持多个文件（逗号分隔） |
| `canyon-url` | ✅ | Canyon 服务器地址 |
| `instrument-cwd` | ✅ | 插桩工作目录（instrumentCwd） |
| `canyon-token` | ❌ | Canyon 认证 token（可选） |
| `build-target` | ❌ | 构建目标（可选，默认为空） |
| `scene` | ❌ | 场景信息 JSON 字符串（可选，默认为空对象） |
| `fail-on-error` | ❌ | 上传失败时是否终止 workflow（默认：true） |

## 输出参数

| 参数 | 说明 |
|------|------|
| `build-hash` | 构建哈希值 |
| `scene-key` | 场景键值 |

## 场景信息（Scene）

Scene 用于区分不同的测试场景。Action 会自动添加以下 GitHub Actions 环境信息：

- `source`: "automation"（自动化）
- `type`: "ci"（CI 测试）
- `env`: "test"（测试环境）
- `trigger`: "pipeline"（流水线触发）
- `workflow`: GitHub workflow 名称
- `runId`: GitHub run ID
- `runAttempt`: GitHub run attempt
- `ref`: Git 引用
- `owner`: 仓库所有者
- `repo`: 仓库名称

你也可以通过 `scene` 参数添加自定义字段。

## 覆盖率文件格式

覆盖率文件应为标准的 Istanbul/NYC 格式的 JSON 文件，例如：

```json
{
  "path/to/file.js": {
    "path": "path/to/file.js",
    "statementMap": {...},
    "fnMap": {...},
    "branchMap": {...},
    "s": {...},
    "f": {...},
    "b": {...}
  }
}
```

## 认证

如果 Canyon 服务器需要认证，可以通过 `canyon-token` 参数提供 token。建议将 token 存储在 GitHub Secrets 中：

1. 在仓库设置中添加 Secret：`CANYON_TOKEN`
2. 在 workflow 中使用：`canyon-token: ${{ secrets.CANYON_TOKEN }}`

## 示例 Workflow

完整的示例：

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with coverage
        run: npm test -- --coverage
      
      - name: Upload coverage to Canyon
        uses: canyon-project/canyon-action@v1
        with:
          coverage-file: coverage/coverage-final.json
          canyon-url: ${{ secrets.CANYON_URL }}
          canyon-token: ${{ secrets.CANYON_TOKEN }}
          instrument-cwd: ${{ github.workspace }}
          build-target: ${{ github.ref_name }}
```

## 开发

### 构建

```bash
pnpm install
pnpm run build
```

构建后的文件会输出到 `dist/` 目录。

### 本地测试

使用 [act](https://github.com/nektos/act) 进行本地测试：

```bash
act -j test
```

### 技术栈

- **TypeScript**: 类型安全的开发
- **tsdown**: 使用 esbuild 进行快速打包
- **@actions/core**: GitHub Actions 核心工具库

## 许可证

MIT
