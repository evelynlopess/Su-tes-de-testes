import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Su-tes-de-testes',
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: 'localhost'
  }
});
