import nextra from 'nextra'

// Set up Nextra with its configuration
const withNextra = nextra({
    // ... Add Nextra-specific options here
})

// Export the final Next.js config with Nextra included
export default withNextra({
    // ... Add regular Next.js options here
    i18n: {
        locales: ['en', 'cn', 'ja'],
        defaultLocale: 'en'
    },
  webpack(config) {
    // rule.exclude doesn't work starting from Next.js 15
    const { test: _test, ...imageLoaderOptions } = config.module.rules.find(
      // @ts-expect-error -- fixme
      rule => rule.test?.test?.('.svg')
    )
    config.module.rules.push({
      test: /\.svg$/,
      oneOf: [
        {
          resourceQuery: /svgr/,
          use: ['@svgr/webpack']
        },
        imageLoaderOptions
      ]
    })
    return config
  },
  turbopack: {
    rules: {
      './app/_icons/*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js'
      }
    }
  },
})
