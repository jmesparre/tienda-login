import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hajufjkjnjjhbcthbnta.supabase.co',
        port: '', // Keep empty unless Supabase uses a non-standard port
        pathname: '/storage/v1/object/public/**', // Allow images from the public storage path
      }
    ],
  },
  /* other config options can go here */
};

export default nextConfig;
