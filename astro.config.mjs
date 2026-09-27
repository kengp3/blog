import { defineConfig } from 'astro/config';
import { copyFile } from 'node:fs/promises';
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  site: 'https://kengp3.github.io',
  base: '/blog',
  trailingSlash: 'always',
  output: 'static',
  publicDir: './public',
  integrations: [
    sitemap(),
    {
      name: 'legacy-sitemap-url',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          await copyFile(new URL('sitemap-index.xml', dir), new URL('sitemap.xml', dir));
        },
      },
    },
  ],
});
