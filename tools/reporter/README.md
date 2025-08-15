# Canyon Reporter

一个基于 Istanbul 的自定义报告器，用于在测试完成后生成可浏览的 HTML 覆盖率报告（带动态按需加载源码 + 覆盖信息）。

## 特性

- 兼容 Istanbul 报告生命周期
- 输出 `index.html` + `dynamic-data/` 动态数据与字体资源
- 支持 `instrumentCwd` 指定代码根目录，解决路径前缀与源码定位

## 安装

```bash
pnpm add -D canyon-reporter
```

## 使用（Vitest）

在项目根目录创建 `vitest.config.ts`，示例：

```ts
import { defineConfig } from 'vitest/config'
import * as path from 'node:path'

const self = path.resolve(__dirname, 'node_modules/canyon-reporter/index.js')

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: [
        'json',
        self,
      ],
    },
  },
})
```

执行：

```bash
pnpm vitest run --coverage
```

生成的覆盖率报告默认位于 `coverage/`，打开 `index.html` 查看。

## API（Node）

```js
const CCR = require('canyon-reporter/lib');

async function main() {
  const ccr = CCR({ instrumentCwd: process.cwd(), reportName: 'All files' });
  await ccr.add({});
  await ccr.generate({ coverage, targetDir: 'coverage' });
}
```

## 目录结构

- `lib/index.js`: 生成报告核心逻辑
- `lib/template.js`: 生成 `index.html` 的模板填充
- `lib/dynamic-data.js`: 生成 `dynamic-data/*.js` 动态源码 + 覆盖信息
- `lib/font.js`: 复制字体资源

## 许可

MIT


