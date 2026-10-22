import type { APIContext } from 'astro';

export function GET({ site }: APIContext) {
  if (!site) throw new Error('robots.txt requires a configured site origin.');
  const isLocal = ['localhost', '127.0.0.1'].includes(site.hostname);
  return new Response(
    `User-agent: *\n${isLocal ? 'Disallow: /' : `Allow: /\nSitemap: ${new URL('sitemap-index.xml', site)}`}\n`,
    {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    },
  );
}
