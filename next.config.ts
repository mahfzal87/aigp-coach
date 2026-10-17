import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray lockfile in the home directory otherwise
  // makes Turbopack treat ~ as the project root and crawl everything in it.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
