import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { profile } from '../data/profile';
import { withBase } from '../lib/urls';

export async function GET(context: APIContext) {
  if (!context.site) throw new Error('RSS requires a configured site origin.');
  const articles = await getCollection('blog');
  return rss({
    title: profile.name,
    description: profile.description,
    site: new URL(withBase('/'), context.site),
    items: articles
      .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
      .map((article) => ({
        title: article.data.title,
        description: article.data.description,
        pubDate: article.data.publishedAt,
        link: new URL(withBase(`/blog/${article.id}/`), context.site).href,
        categories: article.data.tags,
      })),
    customData: '<language>zh-cn</language>',
  });
}
