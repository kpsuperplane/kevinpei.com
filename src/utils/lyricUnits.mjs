import { fromHtml } from 'hast-util-from-html';
import { toHtml } from 'hast-util-to-html';
import { toText } from 'hast-util-to-text';

const ALERT_TYPES = new Set(['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION']);
const ALERT_LABELS = {
  NOTE: 'Note',
  TIP: 'Tip',
  IMPORTANT: 'Important',
  WARNING: 'Warning',
  CAUTION: 'Caution',
};

const VISIBLE_TAGS = new Set(['p', 'h2', 'h3', 'h4']);
const BLOCK_CHILD_TAGS = new Set([
  'blockquote',
  'div',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ol',
  'p',
  'pre',
  'table',
  'ul',
]);
const ANCHOR_TAGS = new Set(['pre', 'table']);
const SENTENCE_START = '[A-Z"\\u2018\\u2019\\u201c\\u201d]';
const SENTENCE_BOUNDARY = new RegExp(
  `([.!?](?:</[^>]+>)*)((?:\\s|<br\\s*/?>)+)(?=(?:<[^>]+>)*${SENTENCE_START})`,
  'g'
);
const TEXT_SENTENCE_SPLIT = new RegExp(`(?<=[.!?])\\s+(?=${SENTENCE_START})`, 'g');

/**
 * Turn GitHub-style alert blockquotes into semantic, styleable callouts.
 * Example: > [!NOTE] ...
 * @returns {import('unified').Transformer<import('hast').Root, import('hast').Root>}
 */
export function rehypeGfmAlerts() {
  return (tree) => {
    visitElements(tree, (node) => {
      if (node.tagName !== 'blockquote') return;

      const firstParagraph = node.children.find(
        (child) => child.type === 'element' && child.tagName === 'p'
      );
      const firstText = firstParagraph?.children?.find((child) => child.type === 'text');
      if (!firstText) return;

      const match = firstText.value.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][\t ]*(?:\r?\n)?/);
      if (!match || !ALERT_TYPES.has(match[1])) return;

      const type = match[1];
      firstText.value = firstText.value.slice(match[0].length);
      if (firstText.value.length === 0) {
        firstParagraph.children = firstParagraph.children.filter((child) => child !== firstText);
      }
      if (firstParagraph.children.length === 0) {
        node.children = node.children.filter((child) => child !== firstParagraph);
      }

      node.properties ??= {};
      node.properties.className = [
        ...(Array.isArray(node.properties.className) ? node.properties.className : []),
        'markdown-alert',
        `markdown-alert-${type.toLowerCase()}`,
      ];
      node.properties.role = 'note';
      node.children.unshift({
        type: 'element',
        tagName: 'p',
        properties: { className: ['markdown-alert-title'] },
        children: [{ type: 'text', value: ALERT_LABELS[type] }],
      });
    });
  };
}

/**
 * Wrap visible lyric units and expose the canonical unit manifest on vfile.data.
 * @param {{ wrapVisible?: boolean }} [options]
 * @returns {import('unified').Transformer<import('hast').Root, import('hast').Root>}
 */
export function rehypeLyricUnits(options = {}) {
  return (tree, file) => {
    const units = applyLyricUnits(tree, options);
    file.data.lyricUnits = units;
  };
}

/**
 * @param {import('hast').Root} tree
 * @param {{ wrapVisible?: boolean }} [options]
 */
export function applyLyricUnits(tree, options = {}) {
  const state = {
    units: [],
    index: 0,
    wrapVisible: options.wrapVisible !== false,
  };

  visitForLyricUnits(tree, [], state);
  return state.units;
}

export function normalizeLyricText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

export function splitTextSentences(text) {
  return normalizeLyricText(text)
    .split(TEXT_SENTENCE_SPLIT)
    .map((part) => normalizeLyricText(part))
    .filter(Boolean);
}

function visitForLyricUnits(node, ancestors, state) {
  if (!('children' in node) || !Array.isArray(node.children)) return;

  for (const child of node.children) {
    if (child.type !== 'element') {
      continue;
    }

    if (isSkipped(child, ancestors)) {
      continue;
    }

    if (isAnchorBlock(child, ancestors)) {
      addAnchorUnits(child, state);
      continue;
    }

    if (isVisibleBlock(child, ancestors)) {
      wrapVisibleBlock(child, state);
      continue;
    }

    visitForLyricUnits(child, [...ancestors, child], state);
  }
}

function wrapVisibleBlock(node, state) {
  const html = toHtml({ type: 'root', children: node.children });
  const parts = splitHtmlSentences(html);
  const wrappedChildren = [];

  for (const part of parts) {
    const fragment = fromHtml(part, { fragment: true });
    const text = normalizeLyricText(toText(fragment));
    if (!text) continue;

    const unit = addUnit(state, text, 'visible');
    if (!state.wrapVisible) continue;

    if (wrappedChildren.length > 0) {
      wrappedChildren.push({ type: 'text', value: ' ' });
    }
    wrappedChildren.push({
      type: 'element',
      tagName: 'span',
      properties: {
        className: ['lyric-sentence'],
        dataLyricId: unit.id,
      },
      children: fragment.children,
    });
  }

  if (state.wrapVisible && wrappedChildren.length > 0) {
    node.children = wrappedChildren;
  }
}

function addAnchorUnits(node, state) {
  for (const text of splitTextSentences(getAnchorText(node))) {
    addUnit(state, text, 'anchor');
  }
}

function getAnchorText(node) {
  if (node.tagName !== 'table') {
    return toText(node);
  }

  const cells = [];
  visitElements(node, (child) => {
    if (child.tagName !== 'td' && child.tagName !== 'th') return;
    const text = normalizeLyricText(toText(child));
    if (text) cells.push(text);
  });
  return cells.join(' ');
}

function addUnit(state, text, mode) {
  const cleanText = normalizeLyricText(text);
  const id = `lyric-${String(state.index + 1).padStart(3, '0')}-${hashText(cleanText)}`;
  const unit = { id, text: cleanText, mode };
  state.index += 1;
  state.units.push(unit);
  return unit;
}

function splitHtmlSentences(html) {
  const boundary = '%%LYRIC_SENTENCE_BOUNDARY%%';
  return html
    .replace(SENTENCE_BOUNDARY, `$1${boundary}`)
    .split(boundary)
    .map((part) => part.trim())
    .filter(Boolean);
}

function isVisibleBlock(node, ancestors) {
  if (hasAncestorTag(ancestors, ['pre', 'table'])) return false;
  if (hasClass(node, 'markdown-alert-title')) return false;
  if (VISIBLE_TAGS.has(node.tagName)) return true;
  if (node.tagName !== 'li') return false;
  return !node.children.some((child) => child.type === 'element' && BLOCK_CHILD_TAGS.has(child.tagName));
}

function isAnchorBlock(node, ancestors) {
  if (hasAncestorTag(ancestors, ['pre', 'table'])) return false;
  return ANCHOR_TAGS.has(node.tagName);
}

function isSkipped(node, ancestors) {
  return (
    node.tagName === 'script' ||
    node.tagName === 'style' ||
    hasClass(node, 'markdown-alert-title') ||
    hasDataLyricSkip(node) ||
    ancestors.some((ancestor) => hasDataLyricSkip(ancestor))
  );
}

function hasAncestorTag(ancestors, tags) {
  return ancestors.some((ancestor) => tags.includes(ancestor.tagName));
}

function hasDataLyricSkip(node) {
  return Boolean(
    node.properties?.dataLyricSkip ||
    node.properties?.['data-lyric-skip']
  );
}

function hasClass(node, className) {
  const classNames = node.properties?.className;
  return Array.isArray(classNames) && classNames.includes(className);
}

function hashText(text) {
  let hash = 0x811c9dc5;
  const input = text.toLowerCase();
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0').slice(0, 8);
}

/**
 * @param {import('hast').Root | import('hast').Element} node
 * @param {(node: import('hast').Element) => void} callback
 */
function visitElements(node, callback) {
  if (node.type === 'element') callback(node);
  if (!('children' in node)) return;
  for (const child of node.children) {
    if (child.type === 'element' || child.type === 'root') {
      visitElements(child, callback);
    }
  }
}
