const fs = require('fs');
const path = require('path');

// 遍历 mock-data 文件夹，读取所有 JSON 文件并合并成 coverage 对象
const mockDataDir = path.join(__dirname, 'mock-data');
const coverage = {};

const jsonFiles = fs
  .readdirSync(mockDataDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => path.join(mockDataDir, file));

jsonFiles.forEach((filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const jsonData = JSON.parse(fileContent);
  // 合并到 coverage 对象中
  Object.assign(coverage, jsonData);
});

const data = {
  provider: 'gitlab',
  repoID: '140539',
  sha: 'ee85105c47336dd65ddb30154c7a03326777e0de',
  instrumentCwd: '/builds/canyon-project/canyon-demo-xtaro',
  reportID: 'initial_coverage_data',
  reportProvider: 'ci',
  buildTarget: 'h5',
  coverage: coverage,
  build: {
    buildProvider: 'gitlab_runner',
    buildID: '159346667',
    branch: 'dev',
  },
};

fetch('http://localhost:8080/api/coverage/map/init', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json',
  },
});
