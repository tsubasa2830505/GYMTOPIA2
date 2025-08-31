/** @type {import('next').NextConfig} */
const nextConfig = {
  // 開発環境の設定
  reactStrictMode: true,
  // 画像の最適化設定
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig