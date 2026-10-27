import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/VRI/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 5173,
    open: true,
  },
});
