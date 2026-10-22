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
const requestedBase = process.env.SITE_BASE ?? '/';
const baseSegments = requestedBase.split('/');
if (
  !/^\/(?:[A-Za-z0-9._~-]+(?:\/[A-Za-z0-9._~-]+)*\/?)?$/.test(requestedBase) ||
  baseSegments.some((segment) => segment === '.' || segment === '..')
) {
  throw new TypeError('SITE_BASE must be an absolute URL path, such as /2hard4meTAT/.');
}
const base = requestedBase.endsWith('/') ? requestedBase : `${requestedBase}/`;

export default defineConfig({
  site: url.origin,
  base,
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
