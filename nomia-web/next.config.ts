import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/v1-rg/live",
        destination: "http://localhost:8080/live.html",
      },
      {
        source: "/v1-rg/mock",
        destination: "http://localhost:8080/mock.html",
      },
      {
        source: "/v1-rg/data",
        destination: "http://localhost:8080/data.html",
      },
      {
        source: "/v1-rg/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
      // Catch-all for other V1-RG assets if needed
      {
        source: "/v1-rg/:path*",
        destination: "http://localhost:8080/:path*",
      },
    ];
  },
};

export default nextConfig;
