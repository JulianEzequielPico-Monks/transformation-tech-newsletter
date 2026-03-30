import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["192.168.0.145"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/s2/favicons",
      },
    ],
  },
};

export default nextConfig;
