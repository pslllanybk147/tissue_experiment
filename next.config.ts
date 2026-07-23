import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin", "jwks-rsa", "jose"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;

