import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Superultra TicTacToe',
        theme_color: '#000000',
      },
    }),
  ],
  server: {
    port: 8080
  },
  build: {
    outDir: 'dist/client'
  }
});
