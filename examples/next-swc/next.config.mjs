/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: {
  //
  // },
  // plugins: [
  //   ["swc-plugin-coverage-instrument", {}]
  // ],
  experimental: {
    swcPlugins: [
      [
        'swc-plugin-coverage-instrument', {},
      ],
    ],
  },
};

export default nextConfig;
