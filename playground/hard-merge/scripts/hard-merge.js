#!/usr/bin/env node
/*
  硬合并（Hard Merge）某个拉取请求的覆盖率：

  - 基线（baseline）为按字典序最大（例如 0004）的提交目录
  - 针对其它提交，将其 `repo/src` 目录下的源码与基线的 `repo/src` 进行对比，仅保留内容完全相同的文件
  - 对这些“未变化的同名文件”使用 istanbul-lib-coverage 进行覆盖率合并（计数器累加）
  - 将合并后的 JSON 输出到 `playground/hard-merge/coverage/coverage-final.json`

  使用方式：
    node scripts/hard-merge.js --pull=<编号>
    或者：
    node scripts/hard-merge.js <编号>

  可选参数：
    --log=<文件路径>  指定日志输出文件路径，默认写入 `playground/hard-merge/coverage/hard-merge.log`
*/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const libCoverage = require('istanbul-lib-coverage');

/**
 * 获取当前时间的 ISO 字符串
 * @returns {string}
 */
function now() {
  return new Date().toISOString();
}

/**
 * 创建简单的日志器（支持写入文件）
 *
 * 优先从命令行参数 `--log=...` 读取日志文件路径；若未提供，则使用传入的默认路径。
 * @param {string} defaultLogFile 默认日志文件路径
 * @returns {{info: Function, warn: Function, error: Function}}
 */
function createLogger(defaultLogFile) {
  let logFile = defaultLogFile;
  const argLog = process.argv.slice(2).find((a) => a.startsWith('--log='));
  if (argLog) {
    logFile = argLog.replace('--log=', '').trim();
  }
  if (logFile) {
    const dir = path.dirname(logFile);
    fs.mkdirSync(dir, { recursive: true });
  }
  const write = (level, message, extra) => {
    const line = `[${now()}] [${level}] ${message}${extra ? ` ${JSON.stringify(extra)}` : ''}`;
    console.log(line);
    if (logFile) fs.appendFileSync(logFile, `${line}\n`);
  };
  return {
    info: (m, e) => write('INFO', m, e),
    warn: (m, e) => write('WARN', m, e),
    error: (m, e) => write('ERROR', m, e),
  };
}

/**
 * 读取并解析 JSON 文件
 * @param {string} file 文件路径
 * @returns {any}
 */
function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * 确保目录存在（若不存在则递归创建）
 * @param {string} dir 目录路径
 */
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * 列出指定目录下的子目录名称，按字典序排序
 * @param {string} dir 目录路径
 * @returns {string[]}
 */
function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

/**
 * 计算文件的 SHA1 哈希
 * @param {string} filePath 文件路径
 * @returns {string} 40 位十六进制哈希
 */
function hashFile(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha1').update(buf).digest('hex');
}

/**
 * 构建目录下“相对路径 → 内容哈希”的映射
 *
 * - 会递归遍历 `rootDir`
 * - 跳过 `node_modules` 与 `coverage` 目录
 * @param {string} rootDir 作为相对路径基准的根目录（通常是 `repo/src`）
 * @returns {Map<string,string>} 相对路径到 SHA1 哈希的映射
 */
function buildHashMap(rootDir) {
  const map = new Map();
  if (!fs.existsSync(rootDir)) return map;
  const stack = [rootDir];
  while (stack.length) {
    const cur = stack.pop();
    const stat = fs.statSync(cur);
    if (stat.isDirectory()) {
      const names = fs.readdirSync(cur);
      for (const n of names) {
        if (n === 'node_modules' || n === 'coverage') continue;
        stack.push(path.join(cur, n));
      }
    } else {
      const rel = path.relative(rootDir, cur);
      map.set(rel, hashFile(cur));
    }
  }
  return map;
}

/**
 * 取两个哈希映射的“未改变”交集（键相同且哈希一致）
 * @param {Map<string,string>} baselineMap 基线哈希映射
 * @param {Map<string,string>} otherMap    其它提交的哈希映射
 * @returns {Set<string>} 相对路径集合
 */
function intersectUnchanged(baselineMap, otherMap) {
  const set = new Set();
  for (const [rel, h] of otherMap) {
    if (baselineMap.has(rel) && baselineMap.get(rel) === h) {
      set.add(rel);
    }
  }
  return set;
}

/**
 * 过滤覆盖率对象，仅保留相对路径（相对于 `fromRepoRoot`）在允许集合内的条目，
 * 并将其键与内部 `path` 字段重写到基线仓库的绝对路径下，以便与基线覆盖率保持一致。
 *
 * @param {Record<string, any>} coverageObj     需要过滤的覆盖率对象（键为绝对路径）
 * @param {string}              fromRepoRoot    覆盖率对象对应的仓库根目录（用于计算相对路径）
 * @param {string}              baselineRepoRoot基线仓库根目录（用于重写到基线绝对路径）
 * @param {Set<string>}         allowedRelSet   允许保留的相对路径集合（例如：'src/add.js'）
 * @returns {Record<string, any>} 过滤并重写后的覆盖率对象
 */
function filterCoverageByRelSet(coverageObj, fromRepoRoot, baselineRepoRoot, allowedRelSet) {
  const out = {};
  for (const absPath of Object.keys(coverageObj)) {
    let rel;
    try {
      rel = path.relative(fromRepoRoot, absPath);
    } catch (_) {
      continue;
    }
    if (allowedRelSet.has(rel)) {
      const baseLineAbsPath = path.join(baselineRepoRoot, rel);
      out[baseLineAbsPath] = {
        ...coverageObj[absPath],
        path: baseLineAbsPath,
      };
    }
  }
  return out;
}

/**
 * CLI 入口：对指定拉取请求（pull）下的多次提交进行“硬合并”覆盖率
 *
 * 参数：
 *   --pull=<number> 或 位置参数 <number>
 *   --log=<file>    可选，日志输出文件
 *
 * 目录结构约定（示例）：
 *   playground/hard-merge/
 *     pulls/
 *       <pull>/
 *         commits/
 *           0001/repo/{src,coverage/coverage-final.json}
 *           0002/repo/{src,coverage/coverage-final.json}
 *           0003/repo/{src,coverage/coverage-final.json}  ← 基线
 */
function main() {
  const arg = process.argv.slice(2).find((a) => a.startsWith('--pull=')) || process.argv[2];
  if (!arg) {
    console.error('Usage: node scripts/hard-merge.js --pull=<number> | <number>');
    process.exit(1);
  }
  const pullNumber = String(arg).replace('--pull=', '');
  const cwd = path.resolve(__dirname, '..');
  const pullDir = path.join(cwd, 'pulls', pullNumber);
  const coverageDir = path.join(cwd, 'coverage');
  ensureDir(coverageDir);
  const logger = createLogger(path.join(coverageDir, 'hard-merge.log'));
  logger.info('开始硬合并', { pull: pullNumber, root: pullDir });
  const commitsDir = path.join(pullDir, 'commits');
  const commitNames = listDirs(commitsDir);
  if (commitNames.length === 0) {
    logger.error('未找到任何 commit', { commitsDir });
    process.exit(1);
  }
  logger.info('检测到的提交', { commits: commitNames });

  const baselineName = commitNames[commitNames.length - 1];
  const baselineRepo = path.join(commitsDir, baselineName, 'repo');
  const baselineSrc = path.join(baselineRepo, 'src');
  const baselineCovFile = path.join(baselineRepo, 'coverage', 'coverage-final.json');
  if (!fs.existsSync(baselineCovFile)) {
    logger.error('未找到基线覆盖率文件', { baselineCovFile });
    process.exit(1);
  }
  logger.info('选择的基线提交', { baseline: baselineName, baselineRepo });

  const baselineCoverage = readJSON(baselineCovFile);
  logger.info('已加载基线覆盖率', { files: Object.keys(baselineCoverage).length });
  const coverageMap = libCoverage.createCoverageMap({});
  coverageMap.merge(baselineCoverage);

  const baselineHashes = buildHashMap(baselineSrc);
  logger.info('已计算基线源码哈希', { files: baselineHashes.size });

  for (const name of commitNames) {
    if (name === baselineName) continue;
    const repoRoot = path.join(commitsDir, name, 'repo');
    const srcRoot = path.join(repoRoot, 'src');
    const covFile = path.join(repoRoot, 'coverage', 'coverage-final.json');
    if (!fs.existsSync(covFile)) {
      logger.warn('跳过该提交：未找到覆盖率文件', { commit: name, covFile });
      continue;
    }

    const otherCoverage = readJSON(covFile);
    const otherHashes = buildHashMap(srcRoot);
    const unchanged = intersectUnchanged(baselineHashes, otherHashes);
    // 将相对 src/ 的路径加上前缀，便于与 repo 根相对路径匹配（示例：'add.js' → 'src/add.js'）
    const unchangedWithPrefix = new Set(Array.from(unchanged).map((rel) => path.join('src', rel)));
    logger.info('提交对比结果', {
      commit: name,
      otherFiles: otherHashes.size,
      unchanged: unchangedWithPrefix.size,
      excluded: otherHashes.size - unchanged.size,
    });

    const filtered = filterCoverageByRelSet(
      otherCoverage,
      repoRoot,
      baselineRepo,
      unchangedWithPrefix
    );

    coverageMap.merge(filtered);
    logger.info('已合并该提交覆盖率', {
      commit: name,
      mergedFiles: Object.keys(filtered).length,
      totalFiles: coverageMap.files().length,
    });
  }

  const outDir = coverageDir;
  ensureDir(outDir);
  const outFile = path.join(outDir, 'coverage-final.json');
  fs.writeFileSync(outFile, JSON.stringify(coverageMap.toJSON(), null, 2));
  logger.info('已写出合并后的覆盖率', { outFile, totalFiles: coverageMap.files().length });
}

main();
