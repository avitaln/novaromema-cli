import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
      // Apply React plugin to React files
      include: /\.(jsx|tsx)$/,
      babel: {
        parserOpts: {
          plugins: ['decorators-legacy', 'classProperties'],
        },
      },
    })
  ],
  root: './test', // Test files will be in ./test directory
  publicDir: '../public', // Reference to project's public directory if any
  
  build: {
    outDir: '../dist-test', // Separate output directory for test builds
    emptyOutDir: true,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/site/widgets/custom-elements'),
    }
  },

  server: {
    port: 3001, // Different port from Wix dev server
    host: true,
    open: true,
    proxy: {
      // Proxy API calls to avoid CORS issues (generic for all endpoints under /api)
      '/api': {
        target: 'https://novaromemasync.fly.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
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
      }
    },
  },

  // Define environment variables for development
  define: {
    'process.env.NODE_ENV': '"development"',
  },

  // Enable TypeScript decorators
  esbuild: {
    target: 'esnext',
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        useDefineForClassFields: false,
      },
    },
  },
});