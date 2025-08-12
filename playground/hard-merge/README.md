### Hard Merge Playground（ABC 模块示例）

本目录用于演示硬合并（Hard Merge）覆盖率策略：只在“源码内容未变化的相同文件”之间进行覆盖率合并。

#### 目录结构

```
playground/hard-merge/
  pulls/1/commits/
    0001/  # 改动 A（a.js）
    0002/  # 改动 B（b.js）
    0003/  # 改动 C（c.js）
    0004/  # 再次改动 B（b.js）
  scripts/
    hard-merge.js
    generate-html.js
  coverage/
    coverage-final.json      # 由脚本生成
    hard-merge.log           # 由脚本生成
```

每个 `commits/000x/repo/` 下均为一个最小化的 Vitest 项目，`src/` 下包含 `a.js/b.js/c.js` 三个模块，每个模块包含 3 个示例函数（共 9 个函数）：

- A：`a1`, `a2`, `a3`
- B：`b1`, `b2`, `b3`
- C：`c1`, `c2`, `c3`

#### 改动轨迹

- 0001：修改 A（`a.js`）。
- 0002：在 0001 的基础上，修改 B（`b.js`）。
- 0003：在 0002 的基础上，修改 C（`c.js`）。
- 0004：在 0003 的基础上，再次修改 B（`b.js`）。

#### 运行测试与生成覆盖率

进入具体提交的 `repo` 目录，安装依赖后运行：

```bash
pnpm i
pnpm run coverage
```

运行完成后会生成 `coverage/coverage-final.json`，脚本会用它们进行硬合并。

#### 硬合并脚本使用

```bash
node scripts/hard-merge.js --pull=1
```

脚本会：

- 选择字典序最大的提交目录作为基线（例如 `0004`）。
- 找出其它提交与基线在 `repo/src` 下“内容完全相同”的文件。
- 仅对“内容相同”的文件合并覆盖率，并将路径重写到基线仓库内。
- 输出合并结果到 `playground/hard-merge/coverage/coverage-final.json`。

#### 说明

- 本示例用于演示“同内容文件覆盖率可硬合并”的策略。
- 不同提交对同一文件的改动，会导致该文件在该提交不被纳入合并。


