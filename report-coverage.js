const fs = require('fs');

// 从环境变量获取数据
const {
  // SERVER_URL,
  API_KEY,
  GITHUB_REPOSITORY,
  GITHUB_SHA,
  GITHUB_REF_NAME,
  GITHUB_RUN_ID,
  GITHUB_ACTOR,
  // GITHUB_SHA,
  GITHUB_REF
} = process.env;

async function main() {
  try {
    // 读取覆盖率数据
    const coverageRaw = fs.readFileSync('./packages/frontend/coverage/coverage-final.json', 'utf8');
    const coverageData = JSON.parse(coverageRaw);

    // 准备要发送的完整数据
    const payload = {
      coverage: Object.keys(coverageData).length,
      "provider": "gitlab",
      "slug": "auto",
      "branch": GITHUB_REF,
      "repoID": GITHUB_REPOSITORY,
      "sha": GITHUB_SHA,
      "instrumentCwd": process.cwd(),
      "buildID": GITHUB_RUN_ID,
      "buildProvider": "github_actions",
    };

    console.log(payload,'payload')

    const SERVER_URL = `https://simple.canyonjs.org/coverage/client`

    console.log('Reporting coverage to:', SERVER_URL);

    // 发送数据
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload),
    }).then(res => res.json());

    console.log('Success:', response);
    process.exit(0);
  } catch (error) {
    console.error('Error reporting coverage:', error.message);
    process.exit(1);
  }
}

main();
