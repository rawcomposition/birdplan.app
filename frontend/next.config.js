/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/openbirding/:path*",
        destination: `${process.env.OPENBIRDING_API_URL || "https://api.openbirding.org"}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
