import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://clubos.de',
  output: 'static',
  compressHTML: true,
  build: {
    format: 'directory',
  },
  i18n: {
    defaultLocale: 'de',
    locales: ['de'],
  },
});
