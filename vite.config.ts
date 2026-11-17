import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // 相對路徑：打包後放在任何子路徑都能運作
  base: './',
  test: { environment: 'jsdom' },
})
