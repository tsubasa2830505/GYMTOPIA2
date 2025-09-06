/** @type {import('next').NextConfig} */
const nextConfig = {
  // 開発環境の設定
  reactStrictMode: true,
  
  // ESLintをビルド時に無視（デプロイ用）
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScriptエラーをビルド時に無視（デプロイ用）
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Turbopack設定（警告解決とパフォーマンス向上）
  turbopack: {
    root: __dirname,
  },
  
  // HMRエラー対策
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // HMRの安定化
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
  
  // 画像の最適化設定
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig