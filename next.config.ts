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
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
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
        source: "/kathleen-chu",
        destination: "/kathleen",
        permanent: true,
      },
      {
        source: "/kathleen-chu/:path*",
        destination: "/kathleen/:path*",
        permanent: true,
      },
      {
        source: "/PCAP-cohort-1",
        destination: "/pcap-cohort-1",
        permanent: true,
      },
      {
        source: "/PCAP-cohort-1/:path*",
        destination: "/pcap-cohort-1/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
