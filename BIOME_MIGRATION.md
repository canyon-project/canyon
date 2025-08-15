# Biome.js 迁移指南

## 概述

我们已经将整个 monorepo 统一迁移到 Biome.js 进行代码格式化和 linting，移除了所有 ESLint 和 Prettier 依赖。

## 变更内容

### 移除的工具
- ESLint 及其所有插件和配置（从 `tools/extension` 项目中移除）
- Prettier 及其配置
- 相关的 VS Code 扩展推荐

### 新增的工具
- Biome.js 作为统一的格式化和 linting 工具
- 统一的配置文件 `biome.json`
- VS Code 集成配置

### 更新的项目
- ✅ `tools/extension` - 移除了所有 ESLint 和 Prettier 依赖，添加了 Biome.js 脚本
- ✅ `packages/frontend` - 已有 Biome.js 脚本
- ✅ `website` - 添加了 Biome.js 脚本
- ✅ `tools/reporter` - 添加了 Biome.js 脚本
- ✅ `packages/backend` - Go 项目，已在配置中忽略
- ✅ `tools/uploader` - Rust 项目，已在配置中忽略

## 可用命令

### 根目录命令
```bash
# 格式化所有文件
pnpm format:fix

# 检查所有文件的格式和 lint 问题
pnpm check

# 修复所有可修复的问题（包括不安全修复）
npx biome check --write --unsafe .

# 在所有子项目中运行格式化
pnpm format:all

# 在所有子项目中运行 lint
pnpm lint:all

# 在所有子项目中运行检查
pnpm check:all
```

### 子项目命令
每个子项目现在都有统一的脚本：
```bash
# 格式化当前项目
pnpm format

# 修复格式问题
pnpm format:fix

# 检查 lint 问题
pnpm lint

# 修复 lint 问题
pnpm lint:fix

# 检查并修复所有问题
pnpm check:fix
```

## VS Code 集成

### 推荐扩展
- `biomejs.biome` - Biome.js 官方扩展

### 不推荐扩展
- `esbenp.prettier-vscode` - 已被 Biome.js 替代
- `dbaeumer.vscode-eslint` - 已被 Biome.js 替代

### 自动配置
- 保存时自动格式化
- 自动导入排序
- 自动修复 lint 问题

## 配置特点

### 格式化规则
- 使用单引号
- 2 空格缩进
- 行宽限制 100 字符
- 自动添加分号
- ES5 风格的尾随逗号

### Lint 规则
- 启用推荐规则集
- 针对 React 项目启用 a11y 规则
- 针对不同项目类型的特殊配置
- 自动排序 CSS 类名（Tailwind CSS）

### 忽略文件
- 自动忽略 `node_modules`、`dist`、`build` 等目录
- 忽略 Go、Rust、Markdown、SQL 文件
- 忽略锁文件和压缩文件
- 忽略 TypeScript 配置文件（因为包含注释）

## 迁移状态

### ✅ 已完成
- 移除了 `tools/extension` 中的所有 ESLint 和 Prettier 依赖
- 为所有 JavaScript/TypeScript 项目添加了统一的 Biome.js 脚本
- 配置了 VS Code 集成
- 修复了语法错误
- 应用了大部分自动修复

### ⚠️ 需要手动处理的问题
- 一些 TypeScript 类型问题（使用 `any` 类型）
- React Hook 依赖项警告
- 无障碍性问题（a11y）
- 未使用的变量和接口

## 迁移后的好处

1. **统一性**: 所有项目使用相同的格式化和 lint 规则
2. **性能**: Biome.js 比 ESLint + Prettier 组合更快
3. **简化**: 单一工具替代多个工具，减少配置复杂度
4. **现代化**: 使用 Rust 编写的现代工具链
5. **维护性**: 减少了依赖项数量，简化了工具链

## 注意事项

- 如果你之前有自定义的 ESLint 或 Prettier 配置，请检查是否需要在 `biome.json` 中添加相应规则
- 第一次运行可能会有大量格式化变更，这是正常的
- 建议在提交前运行 `pnpm check:fix` 确保代码符合新的规范
- 剩余的警告主要是代码质量问题，可以逐步修复