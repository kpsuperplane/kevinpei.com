import type { APIRoute } from 'astro';
import { primaryLinks, socialLinks } from '../utils/navigation';
import { getSortedPosts } from '../utils/posts';
import { absoluteUrl, SITE } from '../utils/site';

export const prerender = true;

function linkEntry(title: string, href: string, description?: string): string {
  const label = title.trim().replace(/\s+/g, ' ').replace(/[\\\[\]]/g, '\\$&');
  const url = absoluteUrl(href).replace(/\(/g, '%28').replace(/\)/g, '%29');
  const note = description?.trim().replace(/\s+/g, ' ');
  return `- [${label}](${url})${note ? `: ${note}` : ''}`;
}

export const GET: APIRoute = async () => {
  const posts = await getSortedPosts();
  const resume = primaryLinks.find(({ label }) => label === 'Resume');
  const keyPages = [
    linkEntry('Home', '/', 'An introduction to Kevin and the complete list of essays.'),
    linkEntry('About Me', '/about', "Kevin's background in engineering, his work on display glasses, and his interests outside work."),
  ];
  if (resume) {
    keyPages.push(linkEntry('Résumé', resume.href, "Kevin's professional experience and projects (PDF)."));
  }

  const essays = posts.map(({ id, data }) =>
    linkEntry(data.title, `/posts/${id}`, data.llmsDescription ?? data.description),
  );
  const contact = primaryLinks
    .filter(link => link !== resume)
    .map(({ label, href }) => linkEntry(label, href));
  const social = socialLinks.map(({ label, href }) => linkEntry(label, href));

  const body = [
    `# ${SITE.title}`,
    '',
    "> Kevin Pei's personal website and essays on product craft, engineering, and life outside work, presented as an album-style collection.",
    '',
    'The About Me page and essays publish their full written text. Audio narration is available on supported pages. Public pages may be indexed and summarized. Use the canonical links below when citing this site, and base biographical summaries on the About Me page and résumé.',
    '',
    '## Key Pages',
    '',
    ...keyPages,
    '',
    ...(essays.length ? ['## Essays', '', ...essays, ''] : []),
    '## Contact',
    '',
    ...contact,
    '',
    '## Optional',
    '',
    ...social,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
