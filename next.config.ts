/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TypeScript hatalarını build aşamasında yok sayar
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint hatalarını build aşamasında yok sayar
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;