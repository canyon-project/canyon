import type { NextConfig } from "next";
import dotenv from 'dotenv';
import path from "node:path";

dotenv.config({
  path: [path.resolve(__dirname, '../../.env')],
});
const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
