import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { getSortedPosts } from '../../../utils/posts';

interface OgImageProps {
  title: string;
  description: string;
  preview: string;
}

const WIDTH = 1200;
const HEIGHT = 630;
const logo = readFileSync('public/icon.png').toString('base64');

const layout = {
  contentX: 108,
  contentWidth: 984,
  frameBottom: 558,
  headerTop: 101,
  logoSize: 42,
  headerToTitle: 12,
  titleToDescription: 26,
  descriptionToPreview: 34,
  title: {
    baselineOffset: 52,
    lineHeight: 82,
    descender: 17,
  },
  description: {
    baselineOffset: 27,
    lineHeight: 46,
    descender: 8,
  },
  preview: {
    baselineOffset: 20,
    lineHeight: 36,
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(value: string, maxLength: number, maxLines: number): string[] {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }

    if (lines.length === maxLines) break;
  }

  if (current && lines.length < maxLines) lines.push(current);

  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:!?-]*$/, '')}...`;
  }

  return lines;
}

function extractPreview(body: string): string {
  const cleaned = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^import\s+.*;$/gm, ' ')
    .replace(/^>.*$/gm, ' ')
    .replace(/^#{1,6}\s+.*$/gm, ' ')
    .replace(/^\s*<[^>]+>\s*$/gm, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const sentences = cleaned.match(/[^.!?]+[.!?]+(?:["')\]]+)?/g) ?? [cleaned];

  return sentences.slice(0, 5).join(' ').trim();
}

function textLines(lines: string[], x: number, y: number, lineHeight: number): string {
  return lines
    .map((line, index) => `<text x="${x}" y="${y + index * lineHeight}">${escapeHtml(line)}</text>`)
    .join('');
}

async function renderOgImage({ title, description, preview }: OgImageProps): Promise<Buffer> {
  const titleLines = wrapText(title, 28, 3);
  const descriptionLines = wrapText(description, 58, 2);
  const titleTop = layout.headerTop + layout.logoSize + layout.headerToTitle;
  const titleY = titleTop + layout.title.baselineOffset;
  const titleBottom =
    titleY + (titleLines.length - 1) * layout.title.lineHeight + layout.title.descender;
  const descriptionTop = titleBottom + layout.titleToDescription;
  const descriptionY = descriptionTop + layout.description.baselineOffset;
  const descriptionBottom =
    descriptionY +
    (descriptionLines.length - 1) * layout.description.lineHeight +
    layout.description.descender;
  const previewTop = descriptionBottom + layout.descriptionToPreview;
  const previewY = previewTop + layout.preview.baselineOffset;
  const previewLines = wrapText(preview, 68, 6);
  const previewClipHeight = Math.max(0, layout.frameBottom - previewTop);
  const previewFadeY = Math.min(Math.max(previewTop + 72, 470), layout.frameBottom);
  const previewFadeHeight = layout.frameBottom - previewFadeY;

  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#ffffff"/>
      <defs>
        <clipPath id="preview-clip">
          <rect x="${layout.contentX}" y="${previewTop}" width="${layout.contentWidth}" height="${previewClipHeight}" />
        </clipPath>
        <linearGradient id="preview-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity="1"/>
        </linearGradient>
      </defs>
      <image href="data:image/png;base64,${logo}" x="${layout.contentX}" y="${layout.headerTop}" width="${layout.logoSize}" height="${layout.logoSize}"/>
      <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fill="#111111">
        <text x="166" y="130" font-size="28" font-weight="600" letter-spacing="0.8">Kevin Pei</text>
        <g font-size="70" font-weight="700" letter-spacing="0">
          ${textLines(titleLines, layout.contentX, titleY, layout.title.lineHeight)}
        </g>
        <g font-size="34" font-weight="400" fill="#666666" letter-spacing="0">
          ${textLines(descriptionLines, layout.contentX, descriptionY, layout.description.lineHeight)}
        </g>
        <g clip-path="url(#preview-clip)" font-size="25" font-weight="400" fill="#8a8a8a" letter-spacing="0">
          ${textLines(previewLines, layout.contentX, previewY, layout.preview.lineHeight)}
        </g>
      </g>
      <rect x="${layout.contentX}" y="${previewFadeY}" width="${layout.contentWidth}" height="${previewFadeHeight}" fill="url(#preview-fade)"/>
      <rect x="72" y="72" width="1056" height="486" rx="0" fill="none" stroke="#dedede" stroke-width="2"/>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function getStaticPaths() {
  const posts = await getSortedPosts();

  return posts
    .filter((post) => !post.data.image?.src)
    .map((post) => ({
      params: { slug: post.id },
      props: {
        title: post.data.title,
        description: post.data.description ?? post.data.title,
        preview: extractPreview(post.body ?? ''),
      } satisfies OgImageProps,
    }));
}

export const GET: APIRoute<OgImageProps> = async ({ props }) => {
  const image = await renderOgImage(props);

  return new Response(image, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
