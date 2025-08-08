import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  console.log(`🏭 ${isProduction ? 'Production' : 'Development'}-Build gestartet`);
  
  // Bundle-Analyse nur im Analyse-Modus
  const isAnalysis = process.env.BUNDLE_ANALYSIS === 'true';
  if (isAnalysis) {
    console.log('🔍 Bundle-Analyse-Modus aktiviert');
  }

  return {
    plugins: [
      react(),
      // Bundle-Analyse nur im Analyse-Modus
      isAnalysis && visualizer({
        filename: 'dist-analysis/bundle-analysis.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap'
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      // Optimierte Chunk-Aufteilung für bessere Performance
      rollupOptions: {
        output: {
          // Dynamische Imports für große Bibliotheken
          manualChunks: (id) => {
            // React und React-DOM zusammenhalten
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }

            // MUI Material-UI Komponenten
            if (id.includes('@mui/material') && !id.includes('@mui/icons-material')) {
              return 'mui-material';
            }

            // MUI Icons separat
            if (id.includes('@mui/icons-material')) {
              return 'mui-icons';
            }

            // Ant Design Core
            if (id.includes('antd') && !id.includes('@ant-design/icons')) {
              return 'antd-core';
            }

            // Ant Design Icons
            if (id.includes('@ant-design/icons')) {
              return 'antd-icons';
            }

            // Lodash - bereits optimiert
            if (id.includes('lodash')) {
              return 'lodash';
            }

            // Axios für HTTP-Requests
            if (id.includes('axios')) {
              return 'axios';
            }

            // Validation-Bibliotheken
            if (id.includes('yup') || id.includes('zod') || id.includes('joi')) {
              return 'validation';
            }

            // React Hook Form
            if (id.includes('react-hook-form') || id.includes('@hookform/resolvers')) {
              return 'hookform-resolvers';
            }

            // Feature-spezifische Chunks
            if (id.includes('neuroflow')) {
              return 'neuroflow';
            }

            if (id.includes('streckengeschaeft')) {
              return 'streckengeschaeft';
            }

            if (id.includes('pos-system')) {
              return 'pos-system';
            }

            if (id.includes('e-invoicing')) {
              return 'e-invoicing';
            }

            // Große Bibliotheken in separate Chunks aufteilen
            if (id.includes('date-fns')) {
              return 'date-fns';
            }

            if (id.includes('recharts')) {
              return 'recharts';
            }

            if (id.includes('quagga')) {
              return 'quagga';
            }

            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }

            if (id.includes('react-query') || id.includes('@tanstack')) {
              return 'react-query';
            }

            if (id.includes('zustand')) {
              return 'zustand';
            }

            if (id.includes('supabase')) {
              return 'supabase';
            }

            // Utility-Bibliotheken
            if (id.includes('clsx') || id.includes('classnames')) {
              return 'utils';
            }

            // Auth-bezogene Module
            if (id.includes('auth') || id.includes('login') || id.includes('register')) {
              return 'auth';
            }

            // Services
            if (id.includes('/services/')) {
              return 'services';
            }

            // Components
            if (id.includes('/components/')) {
              return 'components';
            }

            // Pages
            if (id.includes('/pages/')) {
              return 'pages';
            }

            // Types
            if (id.includes('/types/')) {
              return 'types';
            }

            // Alles andere in other-vendor
            if (id.includes('node_modules')) {
              return 'other-vendor';
            }
          },

          // Chunk-Namen optimieren
          chunkFileNames: () => {
            return `js/[name]-[hash].js`;
          },

          // Entry-Namen optimieren
          entryFileNames: 'js/[name]-[hash].js',

          // Asset-Namen optimieren
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || 'asset';
            const info = name.split('.');
            const ext = info[info.length - 1];
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(name)) {
              return `media/[name]-[hash].${ext}`;
            }
            if (/\.(png|jpe?g|gif|svg|ico|webp)(\?.*)?$/i.test(name)) {
              return `img/[name]-[hash].${ext}`;
            }
            if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(name)) {
              return `fonts/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          }
        }
      },

      // Source Maps nur im Development-Modus
      sourcemap: !isProduction,

      // Minification nur im Production-Modus
      minify: isProduction ? 'terser' : false,

      // Terser-Optimierungen für Production
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
        },
        mangle: {
          safari10: true
        }
      } : undefined,

      // Chunk-Größen-Warnungen
      chunkSizeWarningLimit: 1000,

      // Target für bessere Browser-Kompatibilität
      target: 'es2015',

      // CSS-Code-Splitting
      cssCodeSplit: true,

      // Assets-Inline-Schwelle
      assetsInlineLimit: 4096
    },

    // Development-Server-Optimierungen
    server: {
      port: 3000,
      open: true,
      cors: true
    },

    // Preview-Server
    preview: {
      port: 4173,
      open: true
    },

    // Optimierungen für verschiedene Modi
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@mui/material',
        '@mui/icons-material',
        'antd',
        '@ant-design/icons',
        'axios',
        'react-hook-form',
        'yup',
        'zustand'
      ],
      exclude: [
        // Große Bibliotheken ausschließen für Lazy-Loading
        'date-fns',
        'recharts',
        'quagga',
        'framer-motion'
      ]
    },

    // CSS-Optimierungen
    css: {
      devSourcemap: !isProduction,
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    }
  };
});
