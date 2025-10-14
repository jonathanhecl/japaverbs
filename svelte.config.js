import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      // Configuración específica de Cloudflare
      routes: {
        include: ['/*'],
        exclude: ['/build/*', '/_app/immutable/*']
      }
    }),
    alias: {
      $components: 'src/components',
      $lib: 'src/lib'
    },
    // Importante para el manejo de rutas en Cloudflare
    paths: {
      base: process.env.NODE_ENV === 'production' ? '' : ''
    }
  },
  preprocess: vitePreprocess()
};

export default config;
