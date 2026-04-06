import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/kathleen-chu",
        destination: "/kathleen",
        permanent: true,
      },
      {
        source: "/kathleen-chu/:path*",
        destination: "/kathleen/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
