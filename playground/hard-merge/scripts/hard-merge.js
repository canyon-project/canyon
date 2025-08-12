#!/usr/bin/env node
/*
  Hard merge coverage for a pull:
  - Baseline is the lexicographically largest commit directory (e.g. 0003)
  - For each other commit, compare repo/src files with baseline; keep only files whose contents are identical
  - Merge coverage for identical files using istanbul-lib-coverage (summing counters)
  - Output merged JSON to pulls/<pull>/merged/coverage-final.json
*/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const libCoverage = require('istanbul-lib-coverage');

function now() {
  return new Date().toISOString();
}

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
    const line = `[${now()}] [${level}] ${message}` + (extra ? ` ${JSON.stringify(extra)}` : '');
    console.log(line);
    if (logFile) fs.appendFileSync(logFile, line + '\n');
  };
  return {
    info: (m, e) => write('INFO', m, e),
    warn: (m, e) => write('WARN', m, e),
    error: (m, e) => write('ERROR', m, e),
  };
}

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function hashFile(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha1').update(buf).digest('hex');
}

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

function intersectUnchanged(baselineMap, otherMap) {
  const set = new Set();
  for (const [rel, h] of otherMap) {
    if (baselineMap.has(rel) && baselineMap.get(rel) === h) {
      set.add(rel);
    }
  }
  return set;
}

function filterCoverageByRelSet(coverageObj, fromRepoRoot, baselineRepoRoot, allowedRelSet) {
  console.log(baselineRepoRoot,'baselineRepoRoot')
  const out = {};
  for (const absPath of Object.keys(coverageObj)) {
    let rel;
    try {
      rel = path.relative(fromRepoRoot, absPath);
    } catch (_) {
      continue;
    }

    // console.log(`rel`, rel, allowedRelSet);
    if (allowedRelSet.has(rel)){
      const baseLineAbsPath = path.join(baselineRepoRoot, rel);
      out[baseLineAbsPath] = {
        ...coverageObj[absPath],
        path:baseLineAbsPath
      };
    }
  }
  return out;
}

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
    // 将相对 src/ 的路径加上前缀，便于与 repo 根相对路径匹配（如 src/add.js）
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
      unchangedWithPrefix,
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


