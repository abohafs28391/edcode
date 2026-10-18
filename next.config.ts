import type { NextConfig } from "next";

// Vercel twin of the workspace next.config.ts — identical EXCEPT:
// - `output: "standalone"` removed (that mode is for the workspace's
//   bun .next/standalone/server.js start; Vercel builds and serves itself
//   and warns on standalone output).
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
