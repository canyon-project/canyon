# @canyonjs/git-diff

一个可以自动识别 CI/CD 流水线类型的 npm 包，支持 GitLab CI 和 GitHub Actions。通过侦测 pipeline 的变量来判断当前是 merge request/pull request 还是 commit/push 流水线，从而执行不同的 git diff 逻辑并输出到 `diff.txt` 文件。

## 功能

- 自动检测 CI 平台（GitLab CI / GitHub Actions）
- **GitLab CI**:
  - 支持 Merge Request 事件：比较 `CI_MERGE_REQUEST_DIFF_BASE_SHA` 和 `HEAD`
  - 支持 Commit 事件：比较 `HEAD~1` 和 `HEAD`
- **GitHub Actions**:
  - 支持 Pull Request 事件：比较 `origin/GITHUB_BASE_REF` 和 `GITHUB_SHA`
  - 支持 Push 事件：比较 `GITHUB_SHA~1` 和 `GITHUB_SHA`
- 输出统一的 diff 格式到 `diff.txt` 文件

## 安装

```bash
npm install -g @canyonjs/git-diff
# 或
pnpm add -g @canyonjs/git-diff
```

## 使用方法

### 在 GitLab CI 中使用

```yaml
# .gitlab-ci.yml
generate-diff:
  script:
    - git-diff
    # 或者指定输出路径
    - git-diff --output custom-diff.txt
  artifacts:
    paths:
      - diff.txt
```

### 在 GitHub Actions 中使用

```yaml
# .github/workflows/diff.yml
name: Generate Diff

on:
  pull_request:
  push:

jobs:
  generate-diff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 需要完整历史记录
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install git-diff
        run: npm install -g @canyonjs/git-diff
      
      - name: Generate diff
        run: git-diff
        # 或者指定输出路径
        # run: git-diff --output custom-diff.txt
      
      - name: Upload diff artifact
        uses: actions/upload-artifact@v4
        with:
          name: diff
          path: diff.txt
```

### 作为 npm 脚本使用

```json
{
  "scripts": {
    "diff": "git-diff"
  }
}
```

### 命令行选项

- `--output <path>`: 指定输出文件路径（默认为当前目录下的 `diff.txt`）

## 工作原理

### GitLab CI

1. **Merge Request 事件** (`CI_PIPELINE_SOURCE=merge_request_event`)
   - 自动 fetch `CI_MERGE_REQUEST_DIFF_BASE_SHA`
   - 执行 `git diff --unified=0 --no-color CI_MERGE_REQUEST_DIFF_BASE_SHA HEAD`

2. **Commit 事件** (其他情况)
   - 执行 `git diff --unified=0 --no-color HEAD~1 HEAD`
   - 如果 `HEAD~1` 不存在（如首次提交），会输出空内容

### GitHub Actions

1. **Pull Request 事件** (`GITHUB_EVENT_NAME=pull_request`)
   - 自动 fetch `origin/GITHUB_BASE_REF`
   - 执行 `git diff --unified=0 --no-color origin/GITHUB_BASE_REF GITHUB_SHA`

2. **Push 事件** (其他情况)
   - 执行 `git diff --unified=0 --no-color GITHUB_SHA~1 GITHUB_SHA`
   - 如果前一个提交不存在（如首次提交），会输出空内容

## 环境变量

包会自动检测以下 CI 环境变量：

### GitLab CI
- `CI_PIPELINE_SOURCE`: 流水线触发源
- `CI_MERGE_REQUEST_DIFF_BASE_SHA`: Merge Request 的基础 SHA
- `CI_COMMIT_SHA`: 当前提交的 SHA
- `CI_COMMIT_REF_NAME`: 当前分支名称

### GitHub Actions
- `GITHUB_EVENT_NAME`: 事件类型（pull_request, push等）
- `GITHUB_BASE_REF`: Pull Request 的基础分支
- `GITHUB_HEAD_REF`: Pull Request 的头分支
- `GITHUB_SHA`: 当前提交的 SHA
- `GITHUB_REF`: 分支引用

## 开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 开发模式（监听文件变化）
pnpm dev
```

## License

MIT
