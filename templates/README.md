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

### 方式一：使用 Git Submodule（推荐，支持 GitHub 跳转）

使用 Git Submodule 添加模板后，在 GitHub 上点击 templates 文件夹中的子目录时，会显示一个链接图标，点击可以跳转到对应的子仓库。

#### 使用脚本添加（推荐）

```bash
# 使用提供的脚本添加子模块
./templates/add-submodule.sh report-template-playwright https://github.com/canyon-project/report-template-playwright.git
```

#### 手动添加

```bash
git submodule add https://github.com/canyon-project/report-template-playwright.git templates/report-template-playwright
```

添加后，GitHub 会自动识别并在文件浏览器中显示链接图标 🔗，点击可以跳转到子仓库。

### 方式二：直接克隆模板仓库

```bash
# 克隆到 templates 目录（不会在 GitHub 上显示跳转链接）
git clone https://github.com/canyon-project/report-template-playwright.git templates/report-template-playwright
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
2. 使用脚本添加子模块（推荐）：
   ```bash
   ./templates/add-submodule.sh <template-name> <repository-url>
   ```
   或手动添加：
   ```bash
   git submodule add <repository-url> templates/<template-name>
   ```
3. 更新本 README 文件，添加新模板的描述和链接
4. 提交更改：
   ```bash
   git add templates/
   git commit -m "Add template submodule: <template-name>"
   ```

## GitHub 上的显示效果

当使用 git submodule 添加模板后，在 GitHub 上：

- 📁 `templates/` 文件夹中会显示子模块文件夹
- 🔗 子模块文件夹旁边会显示一个链接图标
- 点击子模块文件夹可以跳转到对应的 GitHub 仓库
- 子模块文件夹会显示当前指向的 commit SHA

这是 GitHub 自动识别的功能，无需额外配置。

## 模板配置文件

模板信息存储在 `templates.json` 中，包含以下字段：

- `name`: 模板名称（目录名）
- `displayName`: 显示名称
- `description`: 模板描述
- `repository`: GitHub 仓库地址
- `category`: 分类（如 testing, reporting 等）
- `framework`: 使用的框架
- `language`: 编程语言
