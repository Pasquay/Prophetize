import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native-web/dist/apis/StyleSheet/registry': fileURLToPath(
        new URL('./src/shims/react-bits-style-registry.ts', import.meta.url),
      ),
    },
  },
  server: {
    port: 4173,
  },
});
