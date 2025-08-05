/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Optimizes for production deployment
  images: {
    domains: ['rcipready.ravijha.co'], // Add your domain for image optimization
  },
  // Configure base path if needed
  // basePath: process.env.NODE_ENV === 'production' ? '' : '',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://rcipready.ravijha.co/api'
      : 'http://localhost:3000/api',
  },
}