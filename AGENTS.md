# Canyon 项目 AI 助手指南

## 项目概述

Canyon 是一个代码覆盖率报告工具的 monorepo 项目，主要用于生成和展示测试覆盖率报告。项目采用 pnpm workspace 管理多个子包，支持多种测试框架（Jest、Mocha、Vitest、Rstest 等）。

## 项目架构

### 核心包结构 (packages/)

1. **backend** - NestJS 后端服务
   - 基于 NestJS 框架
   - 提供 API 服务和数据处理
   - 使用 Prisma 作为 ORM
   - 开发命令：`pnpm dev`（在 backend 目录）

2. **frontend** - React 前端应用
   - 基于 React 19 + Vite 构建
   - 使用 TypeScript
   - 开发命令：`pnpm dev`（在 frontend 目录）

3. **report-component** - 覆盖率报告 React 组件库
   - 可复用的报告展示组件
   - 使用 Ant Design 作为 UI 框架
   - 集成 Monaco Editor 代码编辑器
   - 发布到 npm 的公共包

4. **report-html** - HTML 报告生成器
   - 核心功能包，生成静态 HTML 覆盖率报告
   - 支持多种测试框架集成
   - 使用 Rspack 构建
   - 版本：1.0.0-alpha.28

### 示例项目 (examples/)

提供了多个测试框架的集成示例：
- `report-html-jest` - Jest 集成示例
- `report-html-mocha` - Mocha 集成示例  
- `report-html-vitest` - Vitest 集成示例
- `report-html-rstest` - Rust 测试集成示例
- `report-html-test-runner` - 通用测试运行器示例

### 文档 (docs/)

- 基于 Next.js + Nextra 构建的文档站点
- 开发命令：`pnpm dev-docs`

## 开发指南

### 环境设置

1. **包管理器**：使用 pnpm（版本 10.13.0+）
2. **Node.js**：建议使用最新 LTS 版本
3. **环境配置**：项目会自动从 `.env.example` 复制 `.env` 文件

### 常用命令

```bash
# 安装依赖（会自动检查环境）
pnpm install

# 开发模式（所有包）
pnpm dev

# 构建所有包
pnpm build

# 运行测试
pnpm test

# 代码格式化
pnpm format

# 代码检查
pnpm lint

# 修复代码问题
pnpm lint:fix

# 清理构建产物和依赖
pnpm clean

# 数据库迁移
pnpm migrate
```

### 代码规范

- 使用 Biome 作为代码格式化和检查工具
- 配置文件：`biome.json`
- 支持 TypeScript、React、JavaScript
- 自动导入排序和代码格式化

## AI 助手工作指南

### 修改代码时的注意事项

1. **包依赖管理**
   - 项目使用 pnpm catalog 管理共享依赖版本
   - 添加依赖时注意检查 `pnpm-workspace.yaml` 中的 catalog 配置
   - 优先使用 catalog 中定义的版本

2. **构建工具差异**
   - backend: NestJS CLI
   - frontend: Vite + TypeScript
   - report-component: tsdown
   - report-html: Rspack
   - docs: Next.js

3. **测试集成**
   - 查看 examples 目录了解不同测试框架的集成方式
   - 新增测试框架支持时，参考现有示例结构

4. **版本管理**
   - report-component 和 report-html 是发布包，修改时注意版本号
   - 其他包为私有包，不需要考虑发布

### 常见任务处理

1. **添加新功能**
   - 确定功能属于哪个包
   - 检查是否需要跨包协作
   - 更新相关示例和文档

2. **修复 Bug**
   - 先在对应的 examples 中复现问题
   - 修复后确保所有相关示例正常工作
   - 运行测试确保没有回归

3. **性能优化**
   - 关注 report-html 包的构建产物大小
   - Monaco Editor 是较大的依赖，注意按需加载

4. **依赖更新**
   - 优先更新 catalog 中的共享依赖
   - 注意 React 19 和相关生态的兼容性
   - Vite 使用 beta 版本，更新时需谨慎

### 调试技巧

1. **开发环境**
   - 使用 `pnpm dev` 启动所有服务
   - 各包支持热重载
   - 查看 package.json 中的具体开发命令

2. **构建问题**
   - 使用 `pnpm clean` 清理缓存
   - 检查 TypeScript 配置
   - 注意不同构建工具的配置差异

3. **测试问题**
   - 在对应的 examples 目录中测试
   - 使用 `DEBUG=canyon:report-html` 开启调试日志
   - 检查覆盖率数据格式是否正确

## 项目特色

- **多测试框架支持**：支持主流的 JavaScript/TypeScript 和 Rust 测试框架
- **现代化技术栈**：React 19、Vite 8 beta、TypeScript 5.9+
- **组件化设计**：可复用的报告组件，支持独立使用
- **静态报告生成**：无需服务器即可查看覆盖率报告
- **代码高亮**：集成 Monaco Editor 提供优秀的代码查看体验