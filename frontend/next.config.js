/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode for React
  reactStrictMode: true,
  
  // Configure allowed image domains (for avatars)
  images: {
    domains: ['localhost', 'lh3.googleusercontent.com'],
  },
  
  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
};

module.exports = nextConfig;
