/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimizaciones para producción
  swcMinify: true,
  // Configuración de imágenes si las usas
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
