/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        port: '',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 60,
    formats: ['image/webp'],
    // In dev, Turbopack's first compile (~7s) blocks the image fetch,
    // exceeding Next.js's 7s timeout → 500. Skip optimization in dev.
    unoptimized: process.env.NODE_ENV === 'development',
  },
}

module.exports = nextConfig;
