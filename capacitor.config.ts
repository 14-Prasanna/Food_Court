import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.foodcourt.customerpage',
  appName: 'Food-Court-Customer-page',
  webDir: 'dist',
  server: {
    url: 'http://192.168.x.x:8080', // Your Vite dev server URL (replace with your IP)
    cleartext: true, // Allow HTTP for local dev
  },
};

export default config;