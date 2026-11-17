import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/** 第二個 build：把 <momo-card> 打包成單一 IIFE，外部頁面用一個 <script> 就能載入。 */
export default defineConfig({
  plugins: [vue()],
  publicDir: false,
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'dist/embed',
    emptyOutDir: false,
    lib: {
      entry: 'src/embed/momo-card.ts',
      name: 'MomoCard',
      formats: ['iife'],
      fileName: () => 'momo-card.js',
    },
  },
})
