import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'router-vendor': ['react-router-dom'],
          'utils-vendor': ['axios', 'zustand', '@tanstack/react-query'],
          'ui-vendor': ['antd', '@ant-design/icons', 'chart.js', 'react-chartjs-2'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Erhöhe das Limit auf 1MB
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      'react-router-dom',
      'axios',
      'zustand',
    ],
  },
});
