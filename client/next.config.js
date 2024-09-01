/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', // Adjust the path as necessary
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        port: '',
        pathname: '/**', // Adjust the path as necessary
      },
    ],
  },
  experimental: {
    // Remove invalid keys reactRoot and suppressHydrationWarning
  },
}

module.exports = nextConfig;
