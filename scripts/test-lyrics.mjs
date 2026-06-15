#!/usr/bin/env bun

import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { extractLyricManifest } from './extract-lyrics.mjs';

async function extractFixture(markdown) {
  const dir = mkdtempSync(join(tmpdir(), 'lyrics-test-'));
  const path = join(dir, 'fixture.mdx');
  try {
    writeFileSync(path, markdown);
    return await extractLyricManifest(path);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function visibleTexts(manifest) {
  return manifest.units
    .filter(unit => unit.mode === 'visible')
    .map(unit => unit.text);
}

function anchorTexts(manifest) {
  return manifest.units
    .filter(unit => unit.mode === 'anchor')
    .map(unit => unit.text);
}

{
  const manifest = await extractFixture('Alpha [track packages](https://example.com). Beta follows.');
  assert.deepEqual(visibleTexts(manifest), [
    'Alpha track packages.',
    'Beta follows.',
  ]);
}

{
  const manifest = await extractFixture('> [!NOTE] I am not a researcher. Take care.');
  assert.deepEqual(visibleTexts(manifest), [
    'I am not a researcher.',
    'Take care.',
  ]);
}

{
  const manifest = await extractFixture('> Quote one. Quote two.');
  assert.deepEqual(visibleTexts(manifest), [
    'Quote one.',
    'Quote two.',
  ]);
}

{
  const manifest = await extractFixture('1. First item.\n2. Second item.');
  assert.deepEqual(visibleTexts(manifest), [
    'First item.',
    'Second item.',
  ]);
}

{
  const manifest = await extractFixture('| A | B |\n| --- | --- |\n| Conservative | Balanced |');
  assert.equal(visibleTexts(manifest).length, 0);
  assert.deepEqual(anchorTexts(manifest), ['A B Conservative Balanced']);
}

{
  const manifest = await extractFixture('```js\nconsole.log("hi")\n```');
  assert.equal(visibleTexts(manifest).length, 0);
  assert.deepEqual(anchorTexts(manifest), ['console.log("hi")']);
}

{
  const manifest = await extractFixture(`
import { Image } from 'astro:assets';

<Image src={foo} alt="Decorative" />

Real sentence.
`);
  assert.deepEqual(visibleTexts(manifest), ['Real sentence.']);
}

{
  const manifest = await extractLyricManifest('src/content/posts/thoughts-on-agent-privacy.mdx');
  const visible = visibleTexts(manifest);
  assert.deepEqual(visible.slice(0, 6), [
    'I am not an AI security researcher.',
    'Take my words with a grain of salt.',
    'It’s June 2026 and I have finally succumbed to the personal agent hype.',
    'The internet told me to install Hermes, so I did.',
    'And then they told me to connect it to my email and my Notion, and I did.',
    'And then they told me that magic would occur, and it did!',
  ]);
  assert(visible.includes('My first feeling was one of disappointment that the agent thought it was okay to share my inbox to someone else, but then I realized that is exactly what millions of people do to track their packages.'));
  assert(visible.includes('It is perfectly appropriate to share my email address to subscribe to a newsletter, but it’s wholly inappropriate to send them my calendar too.'));
  assert(anchorTexts(manifest).some(text => text.includes('Conservative Balanced Relaxed')));
  assert(anchorTexts(manifest).some(text => text.includes('flowchart LR')));
}

console.log('lyric extraction tests passed');
