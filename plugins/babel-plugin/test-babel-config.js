module.exports = {
  plugins: [
    'istanbul',
    [
      './lib',
      {
        repoID: '9050', //buildHash
        sha: 'xxxxx', //buildHash
        provider: 'tripgl', //buildHash
        buildTarget: '', //buildHash
        ci: true, // 开关
      },
    ],
  ],
};
