import { randomBytes } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { types as BabelTypes, ConfigAPI, NodePath } from '@babel/core';
import generate from '@babel/generator';
import { generateBuildHash } from './helpers/generate-build-hash';
import { generateInitialCoverage } from './helpers/generate-initial-coverage';
import { computeHash } from './helpers/hash';
import { enrichStatementMapWithHash } from './helpers/statement-map-hash';
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

  // 获取原始源码（用于 hash 计算）
  // 优先使用 hub.file.code，如果没有则使用生成的代码
  const hub = programPath.hub as { file?: { code?: string } } | undefined;
  const originalCode = hub?.file?.code ?? sourceCode;

  // 这部分代码未经过大规模测试验证，谨防异常错误
  // 基于 statementMap 的位置信息，提取源码片段并写入 contentHash 字段
  try {
    if (
      initialCoverageData &&
      initialCoverageData.statementMap &&
      typeof initialCoverageData.statementMap === 'object'
    ) {
      enrichStatementMapWithHash(
        initialCoverageData.statementMap as Parameters<
          typeof enrichStatementMapWithHash
        >[0],
        originalCode,
      );
    }
  } catch (_error) {
    // 忽略提取失败，保持现有行为
  }

  // 基于文件内容计算 contentHash，并写入内存对象
  try {
    if (
      initialCoverageData &&
      typeof initialCoverageData === 'object'
    ) {
      const contentHash = computeHash(originalCode);
      initialCoverageData.contentHash = contentHash;
    }
  } catch (_error) {
    // 忽略
  }

  // 尝试读取 source map 文件（如果 inputSourceMap 不存在）
  if (initialCoverageData && !initialCoverageData.inputSourceMap) {
    try {
      if (initialCoverageData.path) {
        const mapFilePath = path.resolve(initialCoverageData.path + '.map');
        const pathString = fs.readFileSync(mapFilePath, 'utf-8');
        initialCoverageData.inputSourceMap = JSON.parse(pathString);
      }
    } catch (_error) {
      // 如果文件不存在或读取失败，忽略错误，继续执行
    }
  }

  // CI 环境下生成覆盖率文件
  if (config.ci) {
    // 这里要注意，就在当下生成，插桩路径可以改，但是工作目录不能改
    const outputDir = './.canyon_output';

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 确保覆盖率数据有效
    if (initialCoverageData?.path) {
      // 使用 crypto.randomBytes 生成更安全的随机后缀（16 字节 = 32 个十六进制字符）
      const randomSuffix = randomBytes(16).toString('hex');
      const outputFilePath = `./.canyon_output/coverage-final-init-${randomSuffix}.json`;

      // 添加 buildHash 和核心四字段到 .canyon_output 的产物中
      // 根据架构设计，不再将 repoID、sha、provider 等业务信息直接插桩到代码产物中
      // 而是生成 buildHash，并将核心字段写入到 .canyon_output 目录的覆盖率文件中
      // 服务端可以通过 buildHash 查询对应的构建信息，也可以直接从文件中获取核心字段
      const buildHash = generateBuildHash(config);
      const coverageDataWithMetadata = {
        ...initialCoverageData,
        buildHash,
        provider: config.provider,
        repoID: config.repoID,
        sha: config.sha,
        buildTarget: config.buildTarget,
        instrumentCwd: config.instrumentCwd,
      };

      const coverageDataObject: Record<string, CoverageData> = {
        [initialCoverageData.path]: coverageDataWithMetadata,
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

            // 注意：keepMap 属性不在配置接口中，这里保留原逻辑但添加注释说明
            const shouldKeepMap = false; // 默认不保留 map
            if (!shouldKeepMap) {
              const keysToRemove = [
                'statementMap',
                'fnMap',
                'branchMap',
                'inputSourceMap',
              ];
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

              // 添加 hasInputSourceMap 属性
              const hasInputSourceMap = !!initialCoverageData?.inputSourceMap;
              const hasInputSourceMapProperty = types.objectProperty(
                types.identifier('hasInputSourceMap'),
                types.booleanLiteral(hasInputSourceMap),
              );
              objectProperties.push(hasInputSourceMapProperty);
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
