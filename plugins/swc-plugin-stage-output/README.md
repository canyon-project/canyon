# @canyonjs/swc-plugin-stage-output

只做一件事的 SWC 插件：**拿到 AST 后还原成源码，写入阶段产物目录**。

## 功能

- 对每个经手的文件：用 `to_code(program)` 把当前 AST 转成源码字符串。
- 写入目录：`.swc-plugin-stage-output`（与宿主约定用虚拟机映射路径 `/cwd/`）。
- **目录结构**：与源文件一致（如 `src/foo/bar.js` → `.swc-plugin-stage-output/src/foo/`）。
- **文件名**：`{原文件名无扩展名}-{随机数}.txt`，避免重复覆盖。
- 跳过 `node_modules`，不为其生成产物。

## 构建与测试

```bash
# 构建 wasm
npm run prepack

# 跑测试：先 prepack，再用 swc 编译 features → dist，并写入 .swc-plugin-stage-output
npm run test-swc-plugin
```

测试输入在 `features/`（如 `add.js`、`jian.js`），输出：`dist/`（编译结果）、`.swc-plugin-stage-output/features/*.txt`（阶段产物）。
