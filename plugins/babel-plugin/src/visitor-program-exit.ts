import { randomBytes } from 'node:crypto';
import * as fs from 'node:fs';
import type { types as BabelTypes, ConfigAPI, NodePath } from '@babel/core';
import generate from '@babel/generator';
import { generateBuildHash } from './helpers/generate-build-hash';
import { generateInitialCoverage } from './helpers/generate-initial-coverage';
import type { CanyonBabelPluginConfig } from './types';

/**
 * 覆盖率数据接口
 */
interface CoverageData {
  path?: string;
  [key: string]: unknown;
}

/**
 * 返回值接口
 */
interface VisitorProgramExitResult {
  initialCoverageDataForTheCurrentFile: CoverageData | null;
}

/**
 * Program 节点退出时的访问器函数
 * 用于处理覆盖率数据，添加元数据并生成初始覆盖率文件
 *
 * @param api - Babel Plugin API 实例
 * @param programPath - Program 节点的路径
 * @param config - 插件配置参数
 * @returns 包含初始覆盖率数据的对象
 */
export function visitorProgramExit(
  api: ConfigAPI,
  programPath: NodePath<BabelTypes.Program>,
  config: Required<CanyonBabelPluginConfig>,
): VisitorProgramExitResult {
  const sourceCode = generate(programPath.node).code;
  const initialCoverageData = generateInitialCoverage(sourceCode, config);

  // CI 环境下生成覆盖率文件
  if (config.ci) {
    const outputDir = './.canyon_output';

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 确保覆盖率数据有效
    if (initialCoverageData?.path) {
      // 使用 crypto.randomBytes 生成更安全的随机后缀（16 字节 = 32 个十六进制字符）
      const randomSuffix = randomBytes(16).toString('hex');
      const outputFilePath = `./.canyon_output/coverage-final-init-${randomSuffix}.json`;
      const coverageDataObject: Record<string, CoverageData> = {
        [initialCoverageData.path]: initialCoverageData,
      };

      fs.writeFileSync(
        outputFilePath,
        JSON.stringify(coverageDataObject, null, 2),
        'utf-8',
      );
    }
  }

  // 处理代码中的 coverageData 变量
  if (sourceCode.includes('coverageData')) {
    // 使用 api 的 types，Babel 类型定义可能不完整，使用类型断言
    const types = (api as unknown as { types: typeof BabelTypes }).types;

    programPath.traverse({
      VariableDeclarator(
        variablePath: NodePath<BabelTypes.VariableDeclarator>,
      ) {
        const { id, init } = variablePath.node;

        // 检查是否是 coverageData 变量且初始化为对象表达式
        if (
          types.isIdentifier(id, { name: 'coverageData' }) &&
          init &&
          types.isObjectExpression(init)
        ) {
          const objectExpression = init;
          // 过滤掉 SpreadElement，只处理 ObjectProperty 和 ObjectMethod
          const validProperties = objectExpression.properties.filter(
            (
              property,
            ): property is
              | BabelTypes.ObjectProperty
              | BabelTypes.ObjectMethod =>
              types.isObjectProperty(property) ||
              types.isObjectMethod(property),
          );

          const hasInstrumentation = validProperties.some(
            (property) =>
              types.isObjectProperty(property) &&
              types.isIdentifier(property.key, { name: '_coverageSchema' }),
          );

          if (hasInstrumentation) {
            const objectProperties = objectExpression.properties;

            // 查找 inputSourceMap 属性的索引
            const inputSourceMapPropertyIndex = objectProperties.findIndex(
              (property) =>
                (types.isObjectProperty(property) ||
                  types.isObjectMethod(property)) &&
                types.isObjectProperty(property) &&
                types.isIdentifier(property.key, { name: 'inputSourceMap' }),
            );

            // 如果不保留 source map，则删除相关属性并替换 inputSourceMap
            // 注意：keepMap 属性不在配置接口中，这里保留原逻辑但添加注释说明
            const shouldKeepMap = false; // 默认不保留 map
            if (!shouldKeepMap) {
              const keysToRemove = ['statementMap', 'fnMap', 'branchMap'];

              keysToRemove.forEach((keyToRemove) => {
                const propertyIndex = objectProperties.findIndex(
                  (property) =>
                    (types.isObjectProperty(property) ||
                      types.isObjectMethod(property)) &&
                    types.isObjectProperty(property) &&
                    types.isIdentifier(property.key, { name: keyToRemove }),
                );

                if (propertyIndex !== -1) {
                  objectProperties.splice(propertyIndex, 1);
                }
              });

              if (inputSourceMapPropertyIndex !== -1) {
                objectProperties[inputSourceMapPropertyIndex] =
                  types.objectProperty(
                    types.identifier('inputSourceMap'),
                    types.numericLiteral(1),
                  );
              }
            }

            // 添加 buildHash 元数据属性
            // 根据架构设计，不再将 repoID、sha、provider 等业务信息直接插桩到产物中
            // 而是生成 buildHash，服务端通过 buildHash 查询对应的构建信息
            const buildHash = generateBuildHash(config);
            const buildHashProperty = types.objectProperty(
              types.identifier('buildHash'),
              types.stringLiteral(buildHash),
            );
            objectProperties.push(buildHashProperty);
          }
        }
      },
    });
  }

  return { initialCoverageDataForTheCurrentFile: initialCoverageData };
}
