import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "video.gumlet.io",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/signup",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/kathleen",
        destination: "/",
        permanent: false,
      },
      {
        source: "/kathleen/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/kathleen-chu",
        destination: "/",
        permanent: false,
      },
      {
        source: "/kathleen-chu/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/teach/payouts",
        destination: "/payouts",
        permanent: true,
      },
      {
        source: "/teach/programs/new",
        destination: "/programs/new",
        permanent: true,
      },
      {
        source: "/teach",
        destination: "/",
        permanent: true,
      },
      {
        source: "/teach/:path*",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
