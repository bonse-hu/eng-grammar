import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // GitHub Pagesで公開するときは、リポジトリ名に合わせて base を変更してください。
  // 例：リポジトリ名が english-grammar-app の場合は '/english-grammar-app/'
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [],
      manifest: {
        name: '英語文法トレーニング',
        short_name: '英文法',
        description: '英文を読み、和訳を確認する学習アプリ',
        lang: 'ja',
        theme_color: '#f7f8fa',
        background_color: '#f7f8fa',
        display: 'standalone',
        start_url: './',
        icons: []
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      }
    })
  ]
})