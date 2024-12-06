import {generateInitialCoverage} from "./helpers/generate-initial-coverage";
import generate from "@babel/generator";

export const visitorProgramExit = (api,path,serviceParams) => {

  generateInitialCoverage(generate(path.node).code)

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
  }
}
