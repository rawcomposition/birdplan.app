/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  async rewrites() {
    if (!process.env.OPENBIRDING_PROXY_TARGET) return [];
    return [
      {
        source: "/openbirding/:path*",
        destination: `${process.env.OPENBIRDING_PROXY_TARGET}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
