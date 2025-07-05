/**
 * Vite-Konfiguration für das ERP-Frontend
 * 
 * Diese Konfiguration wurde nach den Frontend-Development-Setup-Mustern optimiert,
 * um eine konsistente Entwicklungsumgebung zu gewährleisten und typische Probleme zu vermeiden.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      // Babel-Konfiguration wird aus babel.config.js geladen
      fastRefresh: true,
      jsxRuntime: 'automatic'
    })
  ],
  
  // JSX/TSX-Konfiguration
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    target: 'es2020'
  },
  
  // Server-Konfiguration
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  // Build-Optimierungen
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'esbuild'
  },
  
  // Verbesserte Alias-Konfiguration für Import-Pfade
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@themes': path.resolve(__dirname, './src/themes')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },

  // Optimierungen
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material'
    ]
  }
}); 


