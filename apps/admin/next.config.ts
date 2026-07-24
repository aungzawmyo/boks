import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@boks/api-client",
    "@boks/shared-types",
    "@boks/validation",
    "@boks/configuration",
  ],
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
    
    turbopack: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  
};

export default nextConfig;
