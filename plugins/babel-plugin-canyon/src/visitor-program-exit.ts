import {generateInitialCoverage} from "./helpers/generate-initial-coverage";
import generate from "@babel/generator";
import fs from "fs";
import {computeHash} from "./helpers/hash";
import {enrichFnMapWithHash, enrichStatementMapWithHash} from "./helpers/statement-map-hash";
import sysPath from 'path'

export const visitorProgramExit = (api,path,serviceParams) => {

  const initialCoverageDataForTheCurrentFile = generateInitialCoverage(generate(path.node).code,serviceParams)

  // 这部分代码未经过大规模测试验证，谨防异常错误
  // 基于 statementMap 的位置信息，提取源码片段并写入 hash 字段
  try {
    if (
      initialCoverageDataForTheCurrentFile &&
      initialCoverageDataForTheCurrentFile.statementMap &&
      typeof initialCoverageDataForTheCurrentFile.statementMap === 'object'
    ) {
      const originalCode = (path && path.hub && path.hub.file && path.hub.file.code)
        ? path.hub.file.code
        : generate(path.node).code
      enrichStatementMapWithHash(
        initialCoverageDataForTheCurrentFile.statementMap,
        originalCode
      )
      if (
        initialCoverageDataForTheCurrentFile.fnMap &&
        typeof initialCoverageDataForTheCurrentFile.fnMap === 'object'
      ) {
        enrichFnMapWithHash(
          initialCoverageDataForTheCurrentFile.fnMap,
          originalCode
        )
      }
    }
  } catch (e) {
    // 忽略提取失败，保持现有行为
  }
  // 基于文件内容计算 contentHash，并写入内存对象与 AST 中的 coverageData
  const originalCodeForHash = (path && path.hub && path.hub.file && path.hub.file.code)
    ? path.hub.file.code
    : generate(path.node).code
  const contentHash = computeHash(originalCodeForHash)
  try {
    if (initialCoverageDataForTheCurrentFile && typeof initialCoverageDataForTheCurrentFile === 'object') {
      // @ts-ignore - 动态附加字段
      initialCoverageDataForTheCurrentFile.contentHash = contentHash
      // initialCoverageDataForTheCurrentFile.content = originalCodeForHash
    }
  } catch (e) {
    // 忽略
  }


  // 再尝试根据路径获取一下sourceMap
  try {
    if (!initialCoverageDataForTheCurrentFile.inputSourceMap){
      const pathString = fs.readFileSync(
        sysPath.resolve(initialCoverageDataForTheCurrentFile.path +'.map'),
        'utf-8',
      );
      initialCoverageDataForTheCurrentFile.inputSourceMap = JSON.parse(pathString)
    }
  } catch (e) {
  }

  // 在内容补全后（含 content），再决定是否写入本地（仅 CI 环境）
  try {
    if (serviceParams && serviceParams.ci) {
      // 判断是否是CI环境
      // CI环境才生成.canyon_output/coverage-final.json文件
      if (serviceParams.ci) {
        const filePath = './.canyon_output/coverage-final.json';
        const dir = sysPath.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, {recursive: true});
        }
        // 防止返回的数据为空
        if (initialCoverageDataForTheCurrentFile && initialCoverageDataForTheCurrentFile.path) {
          fs.writeFileSync(`./.canyon_output/coverage-final-init-${String(Math.random()).replace('0.','')}.json`, JSON.stringify({
            [initialCoverageDataForTheCurrentFile.path]: initialCoverageDataForTheCurrentFile
          }, null, 2), 'utf-8');
        }
      }
    }
  } catch (e) {
    // 忽略写入异常
  }

  //



  if (generate(path.node).code.includes('coverageData')) {
    const t = api.types;
    path.traverse({
      VariableDeclarator(variablePath) {
        // 检查是否是 coverageData
        if (
          t.isIdentifier(variablePath.node.id, { name: "coverageData" }) &&
          t.isObjectExpression(variablePath.node.init)
        ) {
          const hasInstrumentation = variablePath.node.init.properties.some((prop) =>
            t.isIdentifier(prop.key, { name: "_coverageSchema" })
          );

          if (hasInstrumentation) {
            // 获取 coverageData 对象的 properties
            const properties = variablePath.node.init.properties;

            if (!serviceParams.keepMap){
              // 替换 statementMap、fnMap、branchMap 删除逻辑，改成 inputSourceMap 替换为 1 的逻辑
              const keysToRemove = ["statementMap", "fnMap", "branchMap"];
              keysToRemove.forEach(key => {
                const index = properties.findIndex(prop =>
                  t.isIdentifier(prop.key, { name: key })
                );

                if (index !== -1) {
                  properties.splice(index, 1); // 删除属性
                }
              });

              // 处理 inputSourceMap，替换为数字 1
              const inputSourceMapIndex = properties.findIndex(prop =>
                t.isIdentifier(prop.key, { name: "inputSourceMap" })
              );

              if (inputSourceMapIndex !== -1) {
                properties[inputSourceMapIndex] = t.objectProperty(
                  t.identifier("inputSourceMap"),
                  t.numericLiteral(1)
                );
              }
            }


            const keysToRemove = ["hash", "_coverageSchema"];
            keysToRemove.forEach(key => {
              const index = properties.findIndex(prop =>
                t.isIdentifier(prop.key, { name: key })
              );

              if (index !== -1) {
                properties.splice(index, 1); // 删除属性
              }
            });

            const addAttributes = serviceParams.addAttributes || Object.keys(serviceParams);

            for (let i = 0; i < addAttributes.length; i++) {
              // only add string type
              if (typeof serviceParams[addAttributes[i]] === 'string') {
                const addField = t.objectProperty(
                  t.identifier(addAttributes[i]), // 键名
                  t.stringLiteral(serviceParams[addAttributes[i]]) // 键值
                );
                properties.push(addField);
              }
            }
          }
        }
      }})
  }
  return {initialCoverageDataForTheCurrentFile}
}
