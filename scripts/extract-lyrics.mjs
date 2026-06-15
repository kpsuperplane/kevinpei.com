#!/usr/bin/env bun

import { readFileSync, writeFileSync } from 'fs';
import { basename } from 'path';
import { pathToFileURL } from 'url';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import remarkSmartypants from 'remark-smartypants';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import { rehypeGfmAlerts, rehypeLyricUnits } from '../src/utils/lyricUnits.mjs';

export async function extractLyricManifest(postPath) {
  const source = readFileSync(postPath, 'utf8');
  const markdown = stripFrontmatter(source);
  const file = { path: postPath, data: {} };
  const processor = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkSmartypants)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeGfmAlerts)
    .use(rehypeLyricUnits, { wrapVisible: false });

  const mdast = processor.parse(markdown);
  await processor.run(mdast, file);
  const units = file.data.lyricUnits ?? [];

  return {
    source: postPath,
    units,
    counts: {
      visible: units.filter(unit => unit.mode === 'visible').length,
      anchor: units.filter(unit => unit.mode === 'anchor').length,
      ignore: units.filter(unit => unit.mode === 'ignore').length,
      total: units.length,
    },
  };
}

function stripFrontmatter(source) {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\s*/, '');
}

function parseArgs(argv) {
  const args = { post: '', out: '' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--post') {
      args.post = argv[++i] ?? '';
    } else if (arg === '--out') {
      args.out = argv[++i] ?? '';
    } else if (!arg.startsWith('--') && !args.post) {
      args.post = arg;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

async function main() {
  const { post, out } = parseArgs(process.argv.slice(2));
  if (!post) {
    throw new Error('Usage: bun scripts/extract-lyrics.mjs --post <post.mdx> [--out <units.json>]');
  }

  const manifest = await extractLyricManifest(post);
  const json = `${JSON.stringify(manifest, null, 2)}\n`;

  if (out) {
    writeFileSync(out, json);
    console.error(`Extracted ${manifest.counts.total} lyric units from ${basename(post)} -> ${out}`);
  } else {
    process.stdout.write(json);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
