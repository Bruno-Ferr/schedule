/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['page.tsx', 'api.ts', 'api.tsx'], // Rotas styles apareciam quando utilizado next mas com essa pageExtensions config,
  // são criadas rotas apenas para essas terminações específicas
}

module.exports = nextConfig
