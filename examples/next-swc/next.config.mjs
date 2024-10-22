/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    swcPlugins: [
      [
        'swc-plugin-coverage-instrument', {
      ...process.env,
      },
      ],
    ],
  },
};

export default nextConfig;
