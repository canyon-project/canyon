import path from 'node:path';
import dotenv from 'dotenv';
import type { NextConfig } from 'next';

dotenv.config({
  path: [path.resolve(__dirname, '../../.env')],
});
const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
