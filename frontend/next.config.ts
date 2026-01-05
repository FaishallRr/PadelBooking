import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/img/lapangan/**",
      },
      {
        protocol: "https",
        hostname: "asset.ayo.co.id",
        pathname: "/**",
      },
    ],
  },

  reactCompiler: true,
  productionBrowserSourceMaps: false,
};

export default nextConfig;
