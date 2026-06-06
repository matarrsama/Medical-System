import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron/simple'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    electron({
      main: {
        entry: 'electron/main.js',
        vite: {
          build: {
            rollupOptions: {
              external: ['electron-updater'],
            },
          },
        },
      },
      preload: {
        input: 'electron/preload.js',
        vite: {
          build: {
            rollupOptions: {
              output: {
                entryFileNames: 'preload.cjs',
              },
            },
          },
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
