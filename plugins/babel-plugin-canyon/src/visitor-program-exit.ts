import {generateInitialCoverage} from "./helpers/generate-initial-coverage";
import generate from "@babel/generator";
import {uploaderCoverageData} from "./helpers/uploader-coverage-data";

// 关键参数 serviceParams ，它由 detectProvider 函数返回，手动设置的参数优先级高于 CI/CD 提供商
export const visitorProgramExit = (api,path,serviceParams) => {
// 生成初始覆盖率数据
  const cov =  generateInitialCoverage(generate(path.node).code)
  uploaderCoverageData(cov,{
    DSN: serviceParams.dsn,
    COMMIT_SHA: serviceParams.sha,
    PROJECT_ID: serviceParams.projectID,
    REPORTER: 'test',
  })
  if (generate(path.node).code.includes('coverageData')) {
    const t = api.types;
    // 遍历 Program 中的所有节点
    path.traverse({
      VariableDeclarator(variablePath) {
        // 检查是否是 coverageData
        if (
          t.isIdentifier(variablePath.node.id, { name: "coverageData" }) &&
          t.isObjectExpression(variablePath.node.init)
        ) {
          // 查找插桩后的字段
          const hasInstrumentation = variablePath.node.init.properties.some((prop) =>
            t.isIdentifier(prop.key, { name: "_coverageSchema" }) || // 确保是已插桩的字段
            t.isIdentifier(prop.key, { name: "s" }) ||
            t.isIdentifier(prop.key, { name: "f" })
          );

          if (hasInstrumentation) {
            // 获取 coverageData 对象的 properties
            const properties = variablePath.node.init.properties;

            // 删除 statementMap、fnMap 和 branchMap 属性
            const keysToRemove = ["statementMap", "fnMap", "branchMap","inputSourceMap"];

            keysToRemove.forEach(key => {
              const index = properties.findIndex(prop =>
                t.isIdentifier(prop.key, { name: key })
              );

              if (index !== -1) {
                properties.splice(index, 1); // 删除属性
              }
            });

            // 增加 sha 字段
            const shaField = t.objectProperty(
              t.identifier("sha"), // 键名
              t.stringLiteral(serviceParams.sha) // 键值
            );
            properties.push(shaField); // 添加新字段
            // 增加 sha 字段
            const projectIDField = t.objectProperty(
              t.identifier("projectID"), // 键名
              t.stringLiteral(serviceParams.projectID) // 键值
            );
            properties.push(projectIDField); // 添加新字段
            // 增加 sha 字段
            const instrumentCwdField = t.objectProperty(
              t.identifier("instrumentCwd"), // 键名
              t.stringLiteral(serviceParams.instrumentCwd) // 键值
            );
            properties.push(instrumentCwdField); // 添加新字段
            // 增加 dsn 字段
            const dsnField = t.objectProperty(
              t.identifier("dsn"), // 键名
              t.stringLiteral(serviceParams.dsn) // 键值
            );
            properties.push(dsnField); // 添加新字段
          }
        }
      }})
    //   end

  }
}
