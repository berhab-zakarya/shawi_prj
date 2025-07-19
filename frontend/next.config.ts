const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
   eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
      },
    ],
  },
}

export default nextConfig