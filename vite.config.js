import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'import.meta.env.URL_API': JSON.stringify(env.URL_API),
      'import.meta.env.URL_FILE': JSON.stringify(env.URL_FILE),
      'import.meta.env.ENTITY_CLIENT': JSON.stringify(env.ENTITY_CLIENT),
      'import.meta.env.TOKEN': JSON.stringify(env.TOKEN),
    },
    server: {
      port: 3000,
      open: true,
    },
  };
});
