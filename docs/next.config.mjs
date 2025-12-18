import nextra from 'nextra';

// Set up Nextra with its configuration
const withNextra = nextra({
});

// Export the final Next.js config with Nextra included
export default withNextra({
  // experimental: {
  //   esmExternals: 'loose'
  // },
  compiler: {
    styledComponents: true
  },
  transpilePackages: ['redoc']
});
