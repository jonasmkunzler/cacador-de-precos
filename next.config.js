/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'mongoose',
      'puppeteer-extra', 
      'puppeteer-extra-plugin-stealth',
    ], 
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'media.pichau.com.br',
        port: '',
        pathname:'/media/**'
      },
      {
        protocol: 'https',
        hostname: '*.kabum.com.br',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '*.terabyteshop.*',
        port: '',
      },
    ],
  }
}

module.exports = nextConfig
