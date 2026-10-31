/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // listing pages read src/data/listings/** at request time (fs), which file tracing cannot see
    outputFileTracingIncludes: {
      "/engines/[engineSlug]/[applicationSlug]": ["./src/data/listings/**/*"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
