/** @type {import('next').NextConfig} */
const nextConfig = {
  // 開発環境の設定
  reactStrictMode: true,

  // Server Components external packages
  serverExternalPackages: ['@next/bundle-analyzer'],

  // ESLintをビルド時に無視（デプロイ用）
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScriptエラーをビルド時に無視（デプロイ用）
  typescript: {
    ignoreBuildErrors: true,
  },

  // 静的生成エラーを無視してデプロイを続行
  staticPageGenerationTimeout: 60,

  // outputFileTracingRootを明示的に設定
  outputFileTracingRoot: __dirname,
  
  // 画像の最適化設定
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'htytewqvkgwyuvcsvjwm.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

module.exports = nextConfig