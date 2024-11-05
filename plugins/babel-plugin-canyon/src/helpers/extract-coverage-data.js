export function extractCoverageData(scriptContent) {
  // console.log(scriptContent)
    const reg0 = /var\s+coverageData\s*=\s*({[\s\S]*?});/;
    const reg1 = /var\s+(\w+)\s*=\s*function\s*\(\)\s*\{([\s\S]*?)\}\(\);/
    try {
        // 可能性一
        const match0 = reg0.exec(scriptContent);
        if (match0) {
            const objectString = match0[1];
            return new Function('return ' + objectString)();
        }
        // 可能性二
        const match1 = reg1.exec(scriptContent);
        if (match1) {
            const functionBody = match1[2];
            const func = new Function(functionBody + 'return coverageData;');
            const result = func();
            return result;
        }
    } catch (e) {
        return null;
    }
    return null
}
