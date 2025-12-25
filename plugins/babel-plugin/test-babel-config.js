module.exports = {
  plugins: [
    'istanbul',
    [
      './lib',
      {
        repoID: '9050',
        sha: 'xxxxx',
        branch: 'master',
        provider: 'tripgl',
        ci: true,
      },
    ],
  ],
};
