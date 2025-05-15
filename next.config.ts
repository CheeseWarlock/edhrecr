import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: 'cards.scryfall.io',
      },
    ],
  },
};

export default nextConfig;
