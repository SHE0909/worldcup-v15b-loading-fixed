import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://she0909.github.io',
  base: '/worldcup-v15b-loading-fixed',
  output: 'static',
  build: {
    assets: 'assets'
  }
});