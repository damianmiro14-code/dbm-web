/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // In some environments (including certain CI/sandbox setups), Next's default
  // multi-process webpack build worker can be problematic. Disabling it keeps
  // compilation in-process. This does not change runtime behavior; it only
  // affects `next build`.
  experimental: {
    webpackBuildWorker: false,
  },

  // This project does not ship with an ESLint configuration yet.
  // Avoid interactive ESLint setup prompts during `next build`.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Local images only by default.
  }
};

export default nextConfig;
