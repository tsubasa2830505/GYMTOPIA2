/** @type {import('next').NextConfig} */
const nextConfig = {
  // 開発環境の設定
  reactStrictMode: true,
  // 画像の最適化設定
  images: {
    domains: ['localhost'],
  },
  // 本番環境での出力設定
  output: 'standalone',
}

module.exports = nextConfig