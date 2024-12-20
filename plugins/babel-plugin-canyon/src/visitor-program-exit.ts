import {generateInitialCoverage} from "./helpers/generate-initial-coverage";
import generate from "@babel/generator";

export const visitorProgramExit = (api,path,serviceParams) => {

  const initialCoverageDataForTheCurrentFile = generateInitialCoverage(generate(path.node).code)

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
            }


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
