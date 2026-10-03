import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

// GitHub Pages serves 404.html for unknown paths. Making it a copy of index.html
// lets a refresh on /fret-wizard/chord load the app, which then reads the path.
const spaFallback = (): Plugin => {
  let outDir = 'dist'
  return {
    name: 'spa-fallback',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'))
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/fret-wizard/',
  plugins: [vue(), spaFallback()],
  resolve: {
    alias: {
      '@': '/src/',
      '@components': '/src/components',
      '@data': '/src/lib/music-theory',
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
        @import "./src/assets/scss/notes-input.scss";
        @import "./src/assets/scss/switch-input.scss";
        @import "./src/assets/scss/range-input.scss";
        `
      }
    }
  }
})
