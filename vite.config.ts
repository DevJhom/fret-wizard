import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/fret-wizard/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src/',
      '@components': '/src/components',
      '@data': '/src/components/data',
      '@stores': '/src/stores',
      '@services': '/src/services',
      '@assets': '/src/assets',
      '@images': '/src/assets/images',
      '@scss': '/src/assets/scss'
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        @import "./src/assets/scss/variables.scss";
        @import "./src/assets/scss/notes.scss";
        @import "./src/assets/scss/range-input.scss";
        `
      }
    }
  }
})
