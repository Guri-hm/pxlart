/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
// GitHub Pages のリポジトリ名などを BASE_PATH に設定する (例: /pxlart-frontend)
// カスタムドメインや user/org ページの場合は空文字のまま
const basePath = process.env.BASE_PATH || ''

const nextConfig = {
    // 静的HTMLエクスポート (GitHub Pages 向け)
    output: 'export',
    // /path/page → /path/page/index.html 形式で出力
    trailingSlash: true,
    webpack: function (config) {
        config.module.rules.push({
            test: /\.md$/,
            use: "raw-loader",
        })
        return config
    },
    distDir: "build",
    basePath: basePath,
    assetPrefix: basePath,
    // output: 'export' では next/image の最適化は使えないため無効化
    images: {
        unoptimized: true,
    },
    env: {
        // バックエンド Flask API のベース URL (ポート含む)
        // 例: https://solopg.com  または  https://localhost:800
        NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || (isProd ? 'https://solopg.com' : 'https://localhost:800'),
        // basePath のクライアント公開用。NEXT_PUBLIC_ プレフィックスで確実に動作
        NEXT_PUBLIC_BASE_PATH: basePath,
    },
}

module.exports = nextConfig
