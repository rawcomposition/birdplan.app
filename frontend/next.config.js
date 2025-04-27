/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["tslib", "@firebase/auth"],
};

module.exports = nextConfig;
