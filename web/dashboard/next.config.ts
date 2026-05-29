import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  transpilePackages: ['@smshive/shared-types'],
  turbopack: {
    // Using process.cwd() ensures an absolute path in all environments
    root: path.resolve(process.cwd(), '../../'),
  },
};

export default nextConfig;
