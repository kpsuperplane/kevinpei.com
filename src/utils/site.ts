export const SITE = {
  url: 'https://kevinpei.com',
  title: 'Kevin Pei',
  description:
    "Hey, I'm Kevin. A personal site about product craft, engineering, mountain detours, and building things with care.",
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
