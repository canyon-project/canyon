// 不检查ts类型
// @ts-nocheck
export function assemblyData (__coverage__: Window['__coverage__']) {
  // 组装数据，确保最小

  const cov = Object.entries(__coverage__).map(([path, { b, f, s }]) => ({
    path,
    b,
    f,
    s,
  })).reduce((acc, { path, b, f, s }) => {
    acc[path] = { b, f, s }
    return acc
  },{})

  // 获取meta参数
  const { projectID, sha, instrumentCwd,dsn,reporter,compareTarget } = Object.values(__coverage__)[0]
  return {
    coverage: cov,
    projectID,
    sha,
    instrumentCwd,
    dsn,
    reporter,
    compareTarget
  }
}
