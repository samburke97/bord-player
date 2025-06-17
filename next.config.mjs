// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("@prisma/client");
    }
    return config;
  },
  // Skip database calls during static generation if needed
  env: {
    SKIP_DATABASE_CALLS:
      process.env.NEXT_PHASE === "phase-production-build" ? "true" : "false",
  },
};

export default nextConfig;
