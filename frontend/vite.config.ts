import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

// Plugin to disable automatic preload for public assets
const disablePreloadPlugin = () => ({
  name: 'disable-preload',
  transformIndexHtml: {
    order: 'pre' as const,
    handler(html: string) {
      // Remove preload links for SVG and font files
      return html.replace(
        /<link[^>]*rel="preload"[^>]*href="[^"]*\.(svg|woff2|woff|ttf)"[^>]*>/g,
        ''
      );
    }
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    strictPort: false, // Allow Vite to find an available port
    hmr: {
      port: 8080, // HMR port
      host: 'localhost',
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Disable preload plugin
    disablePreloadPlugin(),
    // PWA Plugin
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60, // 24 hours
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
            },
          },
        ],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'EchoOps CRM',
        short_name: 'EchoOps CRM',
        description: 'نظام إدارة علاقات العملاء المتقدم',
        theme_color: '#3B82F6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
    // Bundle Analyzer
    mode === 'analyze' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    // Code Splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers'],
          'utils-vendor': ['clsx', 'tailwind-merge', 'date-fns'],
          'chart-vendor': ['recharts'],
        },
        // Naming pattern for chunks
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 1000,

    // Source maps for production debugging
    sourcemap: mode === 'production' ? 'hidden' : true,

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },

    // CSS optimization
    cssCodeSplit: true,

    // Target modern browsers
    target: 'esnext',

    // Enable gzip compression
    reportCompressedSize: false,
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'react-hook-form',
      'clsx',
      'tailwind-merge',
    ],
  },

  // Preview server for production testing
  preview: {
    port: 3000,
    host: true,
  },


}));
