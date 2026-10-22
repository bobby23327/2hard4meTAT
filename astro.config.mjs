import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

if (existsSync('.env')) loadEnvFile('.env');
const site = process.env.SITE_URL || 'http://localhost:4321';
const url = new URL(site);
if (!['http:', 'https:'].includes(url.protocol)) {
  throw new TypeError('SITE_URL must be an absolute HTTP(S) URL.');
}
if (url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
  throw new TypeError('SITE_URL must contain only an origin, such as https://portfolio.example.');
}

export default defineConfig({
  site: url.origin,
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
