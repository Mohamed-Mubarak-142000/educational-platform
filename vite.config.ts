import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('react-dom') || id.includes('react-router') || id.includes('react/')) return 'react';
          if (id.includes('@tanstack/react-query')) return 'query';
          if (id.includes('i18next') || id.includes('react-i18next')) return 'i18n';
          if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('zod')) return 'forms';
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'charts';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('@mantine/core') || id.includes('@mantine/hooks')) return 'mantine';

          return 'vendor';
        },
      },
    },
  },
})
