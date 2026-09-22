import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const root = fileURLToPath(new URL('.', import.meta.url))

const gitProxy = {
  '/__git/gitee': {
    target: 'https://gitee.com',
    changeOrigin: true,
    rewrite: (urlPath: string) => urlPath.replace(/^\/__git\/gitee/, '/api/v5'),
  },
  '/__git/github': {
    target: 'https://api.github.com',
    changeOrigin: true,
    rewrite: (urlPath: string) => urlPath.replace(/^\/__git\/github/, ''),
  },
  '/__git/gitlab': {
    target: 'https://gitlab.com',
    changeOrigin: true,
    rewrite: (urlPath: string) => urlPath.replace(/^\/__git\/gitlab/, '/api/v4'),
  },
  '/__git-remote/gitee': {
    target: 'https://gitee.com',
    changeOrigin: true,
    rewrite: (urlPath: string) => urlPath.replace(/^\/__git-remote\/gitee/, ''),
  },
  '/__git-remote/github': {
    target: 'https://github.com',
    changeOrigin: true,
    rewrite: (urlPath: string) => urlPath.replace(/^\/__git-remote\/github/, ''),
  },
  '/__git-remote/gitlab': {
    target: 'https://gitlab.com',
    changeOrigin: true,
    rewrite: (urlPath: string) => urlPath.replace(/^\/__git-remote\/gitlab/, ''),
  },
}

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(root, './src'),
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  server: {
    fs: {
      allow: [root],
    },
    proxy: gitProxy,
  },
  preview: {
    proxy: gitProxy,
  },
})
