import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        counter: 'src/main.jsx',
        'add-to-cart-button': 'src/add-to-cart/main.jsx',
      },
      output: {
        dir: 'assets',
        entryFileNames: 'vite-[name].js',
        chunkFileNames: 'vite-[name].js',
        assetFileNames: 'vite-[name].[ext]',
      },
    },
    watch: {},
    emptyOutDir: false,
  },
});
