import { parse } from '@babel/parser';
// @ts-ignore
import _traverse from '@babel/traverse';
// @ts-ignore
import _generator from '@babel/generator';

import {visitorProgramExit} from "./visitor-program-exit";
import {detectProvider} from "./helpers/provider";

const { default: traverse } = _traverse;
const { default: generate } = _generator;

function resolveFilename(id: string): string {
  // To remove the annoying query parameters from the filename
  const [filename] = id.split('?vue');
  return id;
}

export default function VitePluginInstrumentation() {
  return {
    name: 'vite-plugin-instrumentation',
    enforce: 'post',
    // @ts-ignore
    transform(code, id) {
      // 解析代码为 AST
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript'],
      });

      // 侦测流水线
      // 优先级：手动设置 > CI/CD提供商
      // hit需要打到__coverage__中，因为ui自动化测试工具部署地方不确定
      // map就不需要，写到本地时，可以侦测本地流水线变量，直接上报上来
      // 他的职责只是寻找到项目，和插桩路径
      const serviceParams = detectProvider({
        envs: process.env,
        // @ts-ignore
        args: {
          // projectID: config.projectID,
          // sha: config.sha,
          // instrumentCwd: config.instrumentCwd,
          // branch: config.branch,
        }
      })

      // console.log(serviceParams,'serviceParams')
      // 遍历和修改 AST
      traverse(ast, {
        Program: {
          // @ts-ignore
          exit(path) {
            // 在 Program 节点的退出时执行
            visitorProgramExit(undefined, path, {
              projectID: serviceParams.slug||'-',
              sha: serviceParams.commit||'-',
              instrumentCwd: process.cwd(),
              dsn: process.env['DSN']||'-'
            });
          },
        },
      });

      // 将修改后的 AST 转换回代码
      const output = generate(ast, {}, code);

      return {
        code: output.code,
        // map: output.map, // 如果需要 Source Map，可以启用
      };
    },
  };
}
