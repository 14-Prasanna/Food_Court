import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

const BASE_URL = "https://server-food-court.onrender.com";

export default defineConfig(({ mode }) => ({
  base: '/Food_Court/', 
  server: {
    host: '::',
    port: 8080,
    proxy: {
      '/send-otp': {
        target: BASE_URL,
        changeOrigin: true,
       
      },
      '/verify-otp': {
        target: BASE_URL,
        changeOrigin: true,
        
      },
      '/check-user': {
        target: BASE_URL,
        changeOrigin: true,
       
      },
      '/menu-items': {
        target: BASE_URL,
        changeOrigin: true,
      
      },
      '/socket.io': {
        target: BASE_URL,
        ws: true,
        changeOrigin: true,
      
      },
      '^/customer': {
        target: BASE_URL,
        changeOrigin: true,
       
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));