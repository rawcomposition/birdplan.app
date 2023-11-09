/** @type {import('next').NextConfig} */

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});

const nextConfig = {
  reactStrictMode: false,
};

module.exports = module.exports = withPWA(nextConfig);
