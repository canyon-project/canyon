module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
      [
        'istanbul',
        {
          // https://github.com/istanbuljs/nyc?tab=readme-ov-file#common-configuration-options
          extension:['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx','.vue']
        }
      ],
      '@canyonjs'
  ]
}
