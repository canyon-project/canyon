export default {
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'istanbul',
      reportsDirectory: 'coverage',
      reporter: ['json', 'html'],
    },
  },
};
