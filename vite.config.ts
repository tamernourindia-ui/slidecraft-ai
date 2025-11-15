import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  // Robust dependency optimization to address pre-bundling issues.
  optimizeDeps: {
    include: [
      'react',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'pdfjs-dist',
    ],
    force: true, // Force re-bundling on server start.
  },
  // Resolve and dedupe React versions to prevent hook errors.
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      // Ensure a single version of React is used across the project.
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      // Retain path aliases from the template.
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  // Build configurations for better compatibility and source mapping.
  build: {
    minify: true,
    sourcemap: 'inline',
    rollupOptions: {
      output: {
        sourcemapExcludeSources: false,
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  // Enable source maps in development for better debugging.
  css: {
    devSourcemap: true,
  },
  // Server configuration from the template.
  server: {
    allowedHosts: true,
  },
  // Define Node.js globals for packages that might need them.
  define: {
    global: 'globalThis',
  },
});