export const SITE = {
  url: 'https://kevinpei.com',
  title: 'Kevin Pei',
  description:
    'Kevin Pei writes about software, product craft, building things, and the occasional tangent.',
  image: '/cover.png',
  author: 'Kevin Pei',
};

export function absoluteUrl(path = '/', base = SITE.url): string {
  return new URL(path, base).toString();
}

export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
