/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
      // 1. Allow the raw IP (Backwards compatibility)
      {
        protocol: 'https',
        hostname: '206.81.19.76', 
        port: '',                 
        pathname: '/uploads/**',
      },
      // 2. Allow the new Magic Domain
      {
        protocol: 'https',
        hostname: '206.81.19.76.nip.io', 
        port: '',                 
        pathname: '/uploads/**',
      },
    ],
  },
}

module.exports = nextConfig
