import type { NextConfig } from "next";
// const dotenv = await import('dotenv');
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
