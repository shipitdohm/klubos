import { mkdir, writeFile } from 'node:fs/promises';

const config = {
  bookingUrl: process.env.PUBLIC_BOOKING_URL?.trim() || '',
  bookingProvider: process.env.PUBLIC_BOOKING_PROVIDER?.trim() || '',
};

await mkdir('public/js', { recursive: true });
await writeFile(
  'public/js/site-config.js',
  `window.KLUBOS_SITE_CONFIG = Object.freeze(${JSON.stringify(config)});\n`,
  'utf8',
);
