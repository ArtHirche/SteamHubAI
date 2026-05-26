import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api-steam': {
        target: 'https://api.steampowered.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-steam/, ''),
      },
    },
  },
});
