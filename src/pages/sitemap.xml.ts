import type { APIRoute } from 'astro';
import { getSortedPosts } from '../utils/posts';
import { absoluteUrl, xmlEscape } from '../utils/site';

export const GET: APIRoute = async () => {
  const posts = await getSortedPosts();
  const urls: Array<{ loc: string; lastmod?: Date }> = [
    { loc: absoluteUrl('/') },
    { loc: absoluteUrl('/about') },
    ...posts.map(post => ({
      loc: absoluteUrl(`/posts/${post.id}`),
      lastmod: post.data.date,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      ({ loc, lastmod }) =>
        `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod.toISOString()}</lastmod>` : ''}\n  </url>`
    )
    .join('\n')}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
