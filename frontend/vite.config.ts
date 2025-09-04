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
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
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
    // Code Splitting with optimized chunks
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core libs
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          // Router
          if (id.includes('react-router')) {
            return 'router-vendor';
          }
          // UI libraries (Radix)
          if (id.includes('@radix-ui')) {
            return 'ui-vendor';
          }
          // Query library
          if (id.includes('@tanstack/react-query')) {
            return 'query-vendor';
          }
          // Form libraries
          if (id.includes('react-hook-form') || id.includes('@hookform')) {
            return 'form-vendor';
          }
          // Chart libraries
          if (id.includes('recharts') || id.includes('d3')) {
            return 'chart-vendor';
          }
          // Icon libraries
          if (id.includes('lucide-react') || id.includes('@heroicons')) {
            return 'icon-vendor';
          }
          // Utility libraries
          if (id.includes('clsx') || id.includes('tailwind-merge') ||
            id.includes('date-fns') || id.includes('class-variance-authority')) {
            return 'utils-vendor';
          }
          // Other vendor libraries
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Optimized naming pattern for chunks
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name.includes('vendor')) {
            return 'assets/vendor/[name].[hash].js';
          }
          return 'assets/chunks/[name].[hash].js';
        },
        entryFileNames: 'assets/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
            return 'assets/images/[name].[hash].[ext]';
          }
          if (/woff2?|eot|ttf|otf/i.test(extType || '')) {
            return 'assets/fonts/[name].[hash].[ext]';
          }
          return 'assets/[name].[hash].[ext]';
        },
      },
      // External dependencies (don't bundle these)
      external: (id) => {
        // Only externalize in production
        if (mode === 'production') {
          return false; // Bundle everything for now
        }
        return false;
      },
    },

    // Performance optimization
    chunkSizeWarningLimit: 500, // Stricter limit

    // Source maps only in development
    sourcemap: mode === 'production' ? false : true,

    // Advanced minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : [],
        passes: 2, // Multiple passes for better compression
      },
      mangle: {
        safari10: true, // Safari 10 compatibility
      },
      format: {
        comments: false, // Remove comments
      },
    },

    // CSS optimization
    cssCodeSplit: true,
    cssMinify: 'lightningcss',

    // Target modern browsers for smaller bundle
    target: ['es2020', 'chrome80', 'firefox78', 'safari14'],

    // Disable compressed size reporting for faster builds
    reportCompressedSize: false,

    // Disable polyfills for smaller bundle
    polyfillModulePreload: false,
  },

  // Dependency optimization for faster dev builds
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'react-hook-form',
      'clsx',
      'tailwind-merge',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'recharts',
    ],
    exclude: [
      // Exclude large libraries that don't need pre-bundling
      '@rollup/rollup-linux-x64-gnu',
      '@rollup/rollup-darwin-x64',
    ],
  },

  // Experimental features for better performance
  experimental: {
    renderBuiltUrl(filename) {
      // Use CDN for assets in production
      if (mode === 'production' && process.env.CDN_URL) {
        return `${process.env.CDN_URL}/${filename}`;
      }
      return filename;
    },
  },

  // Preview server for production testing
  preview: {
    port: 3000,
    host: true,
  },


}));
