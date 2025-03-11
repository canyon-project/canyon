// Mock API services
// In a real application, you would replace these with actual API calls

// Simulated delay for mock API calls
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Generate mock data
const generateMockCommits = (count: number) => {
  const statuses = ['completed', 'in_progress', 'pending', 'failed'];
  const branches = ['main', 'develop', 'feature-1', 'feature-2', 'bugfix-1'];
  const commits = [];

  for (let i = 0; i < count; i++) {
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - i);

    // 随机决定是否有 E2E 测试和单元测试
    const hasE2E = Math.random() > 0.5;
    const hasUnitTest = Math.random() > 0.5;

    // 随机选择一个或多个分支
    const numBranches = Math.floor(Math.random() * 3) + 1;
    const selectedBranches = [];
    for (let j = 0; j < numBranches; j++) {
      const randomIndex = Math.floor(Math.random() * branches.length);
      const branch = branches[randomIndex];
      if (!selectedBranches.includes(branch)) {
        selectedBranches.push(branch);
      }
    }

    commits.push({
      id: `commit-${i}`,
      hash:
        Math.random().toString(36).substring(2, 10) +
        Math.random().toString(36).substring(2, 10),
      message: `feat: Add new feature ${i}`,
      author: 'Developer Name',
      timestamp: timestamp.toISOString(),
      pipelineCount: Math.floor(Math.random() * 5) + 1,
      aggregationStatus: statuses[Math.floor(Math.random() * statuses.length)],
      hasE2E,
      hasUnitTest,
      branches: selectedBranches,
    });
  }

  return commits;
};
const generateMockPipelines = (commitId: string) => {
  const statuses = ['success', 'running', 'failed', 'pending'];
  const testTypes = ['ui', 'manual'];
  const pipelines = [];

  const pipelineCount = Math.floor(Math.random() * 5) + 1;

  for (let i = 0; i < pipelineCount; i++) {
    const startedAt = new Date();
    startedAt.setHours(startedAt.getHours() - i);

    const passed = Math.floor(Math.random() * 100);
    const failed = Math.floor(Math.random() * 20);
    const skipped = Math.floor(Math.random() * 10);

    pipelines.push({
      id: `pipeline-${commitId}-${i}`,
      commitId,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      testType: testTypes[Math.floor(Math.random() * testTypes.length)],
      testResults: {
        passed,
        failed,
        skipped,
      },
      coverage: Math.random() * 30 + 70, // 70-100%
      startedAt: startedAt.toISOString(),
      duration: Math.floor(Math.random() * 30) + 5, // 5-35 minutes
    });
  }

  return pipelines;
};

const generateMockTestCases = (pipelineId: string) => {
  const statuses = ['passed', 'failed', 'skipped'];
  const testCases = [];

  const testCount = Math.floor(Math.random() * 50) + 20;

  for (let i = 0; i < testCount; i++) {
    testCases.push({
      id: `test-${pipelineId}-${i}`,
      pipelineId,
      name: `Test Case ${i}: Should verify functionality ${i}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      duration: Math.floor(Math.random() * 5000) + 100, // 100-5100ms
      coverage: Math.random() * 30 + 70, // 70-100%
    });
  }

  return testCases;
};

export const fetchCommits = async () => {
  await delay(1000);
  return generateMockCommits(10);
};

export const fetchAggregationStatus = async (
  commitId: string,
  testType: string,
) => {
  await delay(500);

  // Calculate random progress values
  const totalTasks = Math.floor(Math.random() * 100) + 50;
  const completedTasks = Math.floor(Math.random() * totalTasks);
  const totalPipelines = Math.floor(Math.random() * 10) + 1;
  const completedPipelines = Math.floor(Math.random() * totalPipelines);
  const overallProgress = Math.floor((completedTasks / totalTasks) * 100);

  // Determine status based on progress
  let status = 'pending';
  if (overallProgress === 100) {
    status = 'completed';
  } else if (overallProgress > 0) {
    status = 'in_progress';
  }

  return {
    overallProgress,
    completedTasks,
    totalTasks,
    completedPipelines,
    totalPipelines,
    status,
  };
};

export const fetchCoverageData = async (commitId: string, testType: string) => {
  await delay(800);

  // Generate random coverage data between 70% and 100%
  return {
    statement: Math.floor(Math.random() * 30) + 70,
    branch: Math.floor(Math.random() * 30) + 70,
    function: Math.floor(Math.random() * 30) + 70,
    line: Math.floor(Math.random() * 30) + 70,
  };
};

export const fetchTestResults = async (commitId: string, testType: string) => {
  await delay(600);

  const passed = Math.floor(Math.random() * 200) + 100;
  const failed = Math.floor(Math.random() * 30);
  const skipped = Math.floor(Math.random() * 20);

  return {
    passed,
    failed,
    skipped,
    total: passed + failed + skipped,
  };
};

export const fetchPipelineDetails = async (
  commitId: string,
  testType: string,
) => {
  await delay(700);

  const pipelines = generateMockPipelines(commitId);

  if (testType !== 'all') {
    return pipelines.filter((pipeline) => pipeline.testType === testType);
  }

  return pipelines;
};

export const fetchTestCaseDetails = async (pipelineId: string) => {
  await delay(600);

  return generateMockTestCases(pipelineId);
};

export const fetchRepositoryOverview = async () => {
  await delay(1000);

  // Helper function to generate realistic coverage data
  const generateCoverage = () => {
    const base = 85; // Base coverage percentage
    const variance = Math.random() * 10; // Add some variance
    return Number((base + variance).toFixed(2));
  };

  // Helper function to generate realistic change data
  const generateChange = () => {
    const change = (Math.random() * 2 - 1) * 2; // Generate change between -2 and +2
    return Number(change.toFixed(2));
  };

  return {
    // Generate coverage values between 85-95%
    totalCoverage: generateCoverage(),
    lineCoverage: generateCoverage(),
    functionCoverage: generateCoverage(),
    branchCoverage: generateCoverage(),

    // Additional statistics
    totalTests: Math.floor(Math.random() * 1000) + 2000, // 2000-3000 total tests
    passingRate: Number((Math.random() * 5 + 95).toFixed(2)), // 95-100% passing rate

    // Generate changes compared to last commit
    coverageChanges: {
      total: generateChange(),
      line: generateChange(),
      function: generateChange(),
      branch: generateChange(),
    },
  };
};

export const fetchCoverageTrend = async () => {
  await delay(800);

  const dates = [];
  const coverages = [];

  // Generate data for the last 30 days
  let baseCoverage = 88; // Start with 88% coverage

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(
      date.toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
      }),
    );

    // Generate realistic coverage progression
    // Small random changes but with a slight upward trend
    const change = Math.random() * 2 - 0.8; // Slight bias towards positive changes
    baseCoverage = Math.min(Math.max(baseCoverage + change, 80), 95); // Keep between 80-95%
    coverages.push(Number(baseCoverage.toFixed(2)));
  }

  return {
    dates,
    coverages,
  };
};

export const fetchCommitOverview = async (commitId: string) => {
  await delay(800);

  // 获取或生成这个 commit 的覆盖率数据
  let currentCoverage = commitCoverageHistory.get(commitId);

  if (!currentCoverage) {
    // 如果是新的 commit，基于仓库的基准覆盖率生成数据
    const baseCoverage = 87; // 假设仓库基准覆盖率是 87%

    currentCoverage = {
      totalCoverage: generateRealisticCoverage(baseCoverage),
      lineCoverage: generateRealisticCoverage(baseCoverage),
      functionCoverage: generateRealisticCoverage(baseCoverage),
      branchCoverage: generateRealisticCoverage(baseCoverage),
      timestamp: Date.now(),
    };

    // 存储到历史记录中
    commitCoverageHistory.set(commitId, currentCoverage);
  }

  // 获取上一个 commit 的覆盖率数据
  const previousCommitId = `commit-${parseInt(commitId.split('-')[1]) + 1}`;
  let previousCoverage = commitCoverageHistory.get(previousCommitId);

  if (!previousCoverage) {
    // 如果没有上一个 commit 的数据，生成一个相近的值
    previousCoverage = {
      totalCoverage: generateRealisticCoverage(
        currentCoverage.totalCoverage,
        2,
      ),
      lineCoverage: generateRealisticCoverage(currentCoverage.lineCoverage, 2),
      functionCoverage: generateRealisticCoverage(
        currentCoverage.functionCoverage,
        2,
      ),
      branchCoverage: generateRealisticCoverage(
        currentCoverage.branchCoverage,
        2,
      ),
      timestamp: currentCoverage.timestamp - 24 * 60 * 60 * 1000, // 假设上一个 commit 是 24 小时前
    };

    // 存储到历史记录中
    commitCoverageHistory.set(previousCommitId, previousCoverage);
  }

  // 计算覆盖率变化
  const coverageChanges = {
    total: calculateChange(
      currentCoverage.totalCoverage,
      previousCoverage.totalCoverage,
    ),
    line: calculateChange(
      currentCoverage.lineCoverage,
      previousCoverage.lineCoverage,
    ),
    function: calculateChange(
      currentCoverage.functionCoverage,
      previousCoverage.functionCoverage,
    ),
    branch: calculateChange(
      currentCoverage.branchCoverage,
      previousCoverage.branchCoverage,
    ),
  };

  // 添加一些详细的覆盖率统计
  const details = {
    totalFiles: Math.floor(Math.random() * 100) + 200, // 200-300 个文件
    coveredFiles: 0, // 将在下面计算
    totalLines: Math.floor(Math.random() * 10000) + 20000, // 20000-30000 行代码
    coveredLines: 0, // 将在下面计算
    uncoveredLines: [], // 未覆盖的关键行
  };

  // 计算文件和行数的覆盖情况
  details.coveredFiles = Math.floor(
    details.totalFiles * (currentCoverage.totalCoverage / 100),
  );
  details.coveredLines = Math.floor(
    details.totalLines * (currentCoverage.lineCoverage / 100),
  );

  // 生成一些未覆盖的关键行
  const numUncoveredLines = Math.floor(Math.random() * 5) + 3; // 3-8 个未覆盖的关键行
  for (let i = 0; i < numUncoveredLines; i++) {
    details.uncoveredLines.push({
      file: `src/components/Component${i + 1}.tsx`,
      line: Math.floor(Math.random() * 100) + 1,
      content: `function handleImportantLogic${i + 1}() {`,
    });
  }

  return {
    // 基础覆盖率数据
    totalCoverage: currentCoverage.totalCoverage,
    lineCoverage: currentCoverage.lineCoverage,
    functionCoverage: currentCoverage.functionCoverage,
    branchCoverage: currentCoverage.branchCoverage,

    // 与上一个 commit 的对比变化
    coverageChanges,

    // 详细统计信息
    details,

    // 时间信息
    timestamp: currentCoverage.timestamp,
    previousTimestamp: previousCoverage.timestamp,

    // 测试执行信息
    testExecutionTime: Math.floor(Math.random() * 120) + 60, // 60-180 秒
    totalTests: Math.floor(Math.random() * 500) + 1000, // 1000-1500 个测试
    passedTests: 0, // 将在下面计算
    skippedTests: Math.floor(Math.random() * 20), // 0-20 个跳过的测试

    // 添加一些关键指标的变化趋势
    trends: {
      lastWeek: {
        totalCoverage: Array.from({ length: 7 }, () =>
          generateRealisticCoverage(currentCoverage.totalCoverage, 1),
        ),
        testsExecuted: Array.from(
          { length: 7 },
          () => Math.floor(Math.random() * 100) + 1400,
        ),
      },
    },
  };
};
