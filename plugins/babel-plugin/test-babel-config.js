module.exports = {
  plugins: [
    'istanbul',
    [
      './dist',
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
