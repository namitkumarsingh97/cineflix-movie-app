import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    },
    // Enable HTTP/2 (requires https)
    // https: true,
    headers: {
      // Enable Brotli compression hints
      'Accept-Encoding': 'br, gzip, deflate',
      // Cache control for static assets
      'Cache-Control': 'public, max-age=31536000, immutable',
    }
  },
  build: {
    // Enable Brotli compression in build
    rollupOptions: {
      output: {
        // Code splitting for better caching
        manualChunks: {
          'vendor': ['vue', 'vue-router'],
          'icons': ['lucide-vue-next'],
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', 'vue-router', 'lucide-vue-next'],
  }
})

