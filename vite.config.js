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
    headers: {
      'Accept-Encoding': 'br, gzip, deflate',
      'Cache-Control': 'public, max-age=31536000, immutable',
    }
  },
  build: {
    // Minify and optimize - use esbuild for faster builds
    minify: 'esbuild', // Faster than terser, good enough for production
    // Terser is slower but produces smaller bundles - use for final production if needed
    // minify: 'terser',
    // terserOptions: {
    //   compress: {
    //     drop_console: true,
    //     drop_debugger: true,
    //     pure_funcs: ['console.log', 'console.info', 'console.debug'],
    //   },
    // },
    rollupOptions: {
      output: {
        // Better code splitting for performance
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('vue-router')) {
              return 'vendor-core';
            }
            if (id.includes('lucide-vue-next')) {
              return 'vendor-icons';
            }
            if (id.includes('axios')) {
              return 'vendor-network';
            }
            // HLS.js should be lazy loaded, not in vendor chunk
            // if (id.includes('hls.js')) {
            //   return 'vendor-hls';
            // }
            // Other node_modules
            return 'vendor-other';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize asset inlining threshold
    assetsInlineLimit: 4096, // 4kb
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'lucide-vue-next'],
    exclude: [],
  },
  // Performance optimizations
  esbuild: {
    // Drop console and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})

