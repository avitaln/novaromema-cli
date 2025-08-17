import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Switch between localhost and production
const IS_LOCAL = true; // Set to false for production
const API_TARGET = IS_LOCAL ? 'http://localhost:8080' : 'https://novaromema-public.fly.dev';

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
        target: API_TARGET,
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
      },
      // Proxy home endpoint
      '/home': {
        target: API_TARGET,
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('home proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Home Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Home Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      // Proxy products endpoint
      '/products': {
        target: API_TARGET,
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('products proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Products Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Products Response from the Target:', proxyRes.statusCode, req.url);
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