import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env': {}
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'mui-core': ['@mui/material', '@mui/icons-material'],
          'd3': ['d3'],
          'recharts': ['recharts'],
          'xlsx': ['xlsx'],
          'react-dnd': ['@dnd-kit/core', '@dnd-kit/modifiers', '@dnd-kit/sortable']
        }
      }
    },
    minify: 'esbuild'
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@mui/material', 'd3', 'recharts']
  }
})