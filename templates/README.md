# Templates

这个文件夹包含了 Canyon 项目的模板仓库，用于快速开始使用 Canyon。

## 可用的模板

模板仓库列表存储在 `templates.json` 文件中。当前可用的模板包括：

### Playwright 模板

- **report-template-playwright**: Playwright 测试框架的覆盖率报告模板
  - 仓库地址: https://github.com/canyon-project/report-template-playwright
  - 描述: 使用 Playwright 进行端到端测试并生成覆盖率报告的完整示例
  - 框架: Playwright
  - 语言: TypeScript

## 如何使用

### 方式一：直接克隆模板仓库

```bash
# 克隆到 templates 目录
git clone https://github.com/canyon-project/report-template-playwright.git templates/report-template-playwright
```

### 方式二：使用 Git Submodule（推荐）

如果你想将模板作为子模块添加到项目中：

```bash
git submodule add https://github.com/canyon-project/report-template-playwright.git templates/report-template-playwright
```

### 更新子模块

```bash
git submodule update --remote
```

### 克隆包含子模块的项目

```bash
git clone --recurse-submodules <repository-url>
```

或者如果已经克隆了项目：

```bash
git submodule update --init --recursive
```

## 添加新模板

如果你想添加新的模板仓库，请：

1. 更新 `templates.json` 文件，添加新模板的信息
2. 使用 git submodule 添加仓库：
   ```bash
   git submodule add <repository-url> templates/<template-name>
   ```
3. 更新本 README 文件，添加新模板的描述和链接

## 模板配置文件

模板信息存储在 `templates.json` 中，包含以下字段：

- `name`: 模板名称（目录名）
- `displayName`: 显示名称
- `description`: 模板描述
- `repository`: GitHub 仓库地址
- `category`: 分类（如 testing, reporting 等）
- `framework`: 使用的框架
- `language`: 编程语言
