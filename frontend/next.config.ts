import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
  allowedDevOrigins: ['192.168.1.107', '192.168.1.106'],
};

export default nextConfig;
