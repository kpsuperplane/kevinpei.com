import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { absoluteUrl, xmlEscape } from '../utils/site';
import { tagToSlug } from '../utils/tags';

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts');
  const tagLastmod = new Map<string, Date>();

  const urls = [
    { loc: absoluteUrl('/') },
    { loc: absoluteUrl('/about') },
    ...posts.map(post => ({
      loc: absoluteUrl(`/posts/${post.id}`),
      lastmod: post.data.date,
    })),
  ];

  for (const post of posts) {
    for (const tag of post.data.tags) {
      const slug = tagToSlug(tag);
      const existing = tagLastmod.get(slug);
      if (!existing || post.data.date > existing) tagLastmod.set(slug, post.data.date);
    }
  }

  for (const [slug, lastmod] of [...tagLastmod].sort(([a], [b]) => a.localeCompare(b))) {
    urls.push({ loc: absoluteUrl(`/tags/${slug}`), lastmod });
  }

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
