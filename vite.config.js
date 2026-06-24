import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/football': {
          target: 'https://api.football-data.org',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api\/football/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const key = env.VITE_FOOTBALL_API_KEY || env.FOOTBALL_API_KEY;
              if (key) proxyReq.setHeader('X-Auth-Token', key);
            });
          },
        },
      },
    },
  };
});
