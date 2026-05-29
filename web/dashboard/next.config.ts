import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  transpilePackages: ['@smshive/shared-types'],
  turbopack: {
    root: '../../',
  },
};

export default nextConfig;
