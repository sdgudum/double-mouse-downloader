import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import packageJson from '../../package.json';

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  base: './',
  build: {
    outDir: '../../dev-build/views/',
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
});
