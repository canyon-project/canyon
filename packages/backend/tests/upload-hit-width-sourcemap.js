const fs = require('fs');
const path = require('path');

// 遍历 .canyon_output 文件夹，读取所有 JSON 文件并合并成 coverage 对象
const mockDataDir = path.join(__dirname, '.canyon_output');
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
  coverage: coverage,
};

fetch('http://localhost:8080/api/coverage/map/init', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then((res) => res.json())
  .then((res) => {
    console.log('Response from server:', res);
  })
  .catch((err) => {
    console.error('Error occurred:', err);
  });
