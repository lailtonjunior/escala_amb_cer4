/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite todas as origens durante desenvolvimento
  allowedDevOrigins: ['*'],
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig