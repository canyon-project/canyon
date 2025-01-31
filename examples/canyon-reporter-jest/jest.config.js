/** @type {import('jest').Config} */
const config = {
  // coverageProvider: 'istanbul',
  coverageReporters: [
    // 原本的报告器
    'clover', 'json', 'lcov',
    // canyon-reporter
    'canyon-reporter'
  ],
};

module.exports = config;
