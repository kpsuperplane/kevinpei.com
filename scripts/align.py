#!/usr/bin/env python3
"""
align.py — Map Whisper transcript to post sentences using word-level alignment.

Uses per-word timestamps from Whisper to precisely find where each post
sentence starts and ends in the audio, tolerating small deviations between
the written text and the narration (fillers, paraphrasing, minor skips).

Usage:
  python scripts/align.py \
    --post src/content/posts/notes-on-fast-software.md \
    --whisper scripts/whisper-out/notes-on-fast-software.json \
    --out public/audio/notes-on-fast-software.json
"""

import argparse
import json
import re
import sys
from difflib import SequenceMatcher


# ── Markdown stripping ────────────────────────────────────────────────────────

def strip_markdown(text: str) -> str:
    text = re.sub(r'```[\s\S]*?```', ' ', text)
    text = re.sub(r'`[^`]+`', ' ', text)
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    text = re.sub(r'\*{1,3}([^*]+)\*{1,3}', r'\1', text)
    text = re.sub(r'_{1,3}([^_]+)_{1,3}', r'\1', text)
    text = re.sub(r'!\[[^\]]*\]\([^)]+\)', '', text)
    text = re.sub(r'^>\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^[-*_]{3,}\s*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)
    return text


# ── Sentence extraction ───────────────────────────────────────────────────────

SENTENCE_SPLIT = re.compile(u"(?<=[.!?])\\s+(?=[A-Z\u2018\u2019\u201c\u201d])")

def extract_sentences(md_path: str) -> list[str]:
    with open(md_path, encoding='utf-8') as f:
        raw = f.read()
    raw = re.sub(r'^---[\s\S]*?---\s*', '', raw)

    sentences = []
    for para in re.split(r'\n{2,}', raw):
        para = para.strip()
        if not para:
            continue
        plain = strip_markdown(para).strip()
        if not plain:
            continue
        for part in SENTENCE_SPLIT.split(plain):
            part = part.strip()
            if part:
                sentences.append(part)
    return sentences


# ── Word normalisation ────────────────────────────────────────────────────────

def tokenize(text: str) -> list[str]:
    """Lowercase alphanumeric tokens only (strips punctuation)."""
    return re.findall(r'\w+', text.lower())


# ── Word-level alignment ──────────────────────────────────────────────────────

def flatten_words(whisper_data: dict) -> list[dict]:
    """
    Flatten all per-word entries from Whisper segments into a single list.
    Each entry: {'text': str, 'start': float, 'end': float}
    Words with no text after stripping are skipped.
    """
    words = []
    for seg in whisper_data.get('segments', []):
        for w in seg.get('words') or []:
            tok = re.findall(r'\w+', w.get('word', '').lower())
            if tok:
                words.append({
                    'text':  tok[0],
                    'start': w['start'],
                    'end':   w['end'],
                    'raw':   w.get('word', ''),
                })
    return words


def best_window(
    post_tokens:  list[str],
    trans_words:  list[dict],
    start_idx:    int,
    search_ahead: int = 60,
) -> tuple[int, int, float]:
    """
    Find the transcript window [i, j) that best matches post_tokens,
    searching from start_idx forward by up to search_ahead words.

    Tries window lengths from 50% to 200% of len(post_tokens) to handle
    contractions, fillers, and minor omissions.

    Returns (best_i, best_j, best_score).  best_i == -1 if nothing found.
    """
    n     = len(post_tokens)
    limit = min(start_idx + search_ahead, len(trans_words))

    best_i, best_j, best_score = -1, -1, 0.0

    lo = max(1, int(n * 0.5))
    hi = min(int(n * 2.0) + 1, limit - start_idx + 1)

    for length in range(lo, hi):
        for i in range(start_idx, limit - length + 1):
            j = i + length
            window_tokens = [trans_words[k]['text'] for k in range(i, j)]
            score = SequenceMatcher(None, post_tokens, window_tokens).ratio()
            if score > best_score:
                best_score = score
                best_i, best_j = i, j

    return best_i, best_j, best_score


MATCH_THRESHOLD = 0.40   # below this, mark as null and don't advance
SKIP_TOLERANCE  = 20     # words the pointer can jump forward looking for a match


def align(post_sentences: list[str], trans_words: list[dict]) -> list[dict]:
    """
    Greedy left-to-right word-level alignment.
    Returns one {start, end} (or {start: null, end: null}) per post sentence.
    """
    results = []
    word_idx = 0

    for sent in post_sentences:
        post_toks = tokenize(sent)

        if not post_toks or word_idx >= len(trans_words):
            results.append({'start': None, 'end': None})
            continue

        i, j, score = best_window(post_toks, trans_words, word_idx,
                                   search_ahead=SKIP_TOLERANCE + len(post_toks) * 2)

        if score < MATCH_THRESHOLD or i < 0:
            results.append({'start': None, 'end': None})
            # Don't advance — next sentence might still match from word_idx
        else:
            matched = trans_words[i:j]
            # words = [w0.start, w1.start, …, wN.end] — boundaries for each word
            word_times = [round(w['start'], 3) for w in matched] + [round(matched[-1]['end'], 3)]
            results.append({
                'start': word_times[0],
                'end':   word_times[-1],
                'words': word_times,
            })
            word_idx = j   # advance past consumed words

    return results


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description='Align Whisper word-level transcript to post sentences')
    parser.add_argument('--post',    required=True)
    parser.add_argument('--whisper', required=True)
    parser.add_argument('--out',     required=True)
    args = parser.parse_args()

    with open(args.whisper, encoding='utf-8') as f:
        whisper_data = json.load(f)

    trans_words = flatten_words(whisper_data)
    segments    = whisper_data.get('segments', [])
    duration    = segments[-1]['end'] if segments else (
                  trans_words[-1]['end'] if trans_words else 0.0)

    post_sentences = extract_sentences(args.post)
    alignments     = align(post_sentences, trans_words)

    matched   = sum(1 for a in alignments if a['start'] is not None)
    unmatched = len(alignments) - matched
    print(f'Post sentences  : {len(post_sentences)}')
    print(f'Transcript words: {len(trans_words)}')
    print(f'Matched         : {matched}  ({100*matched//max(len(alignments),1)}%)')
    print(f'Fallback (null) : {unmatched}')
    print(f'Duration        : {duration:.1f}s')

    output = {'duration': round(duration, 3), 'sentences': alignments}

    import os
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2)
    print(f'Written → {args.out}')

    if matched / max(len(alignments), 1) < 0.70:
        print('\n⚠  Less than 70% matched. Try --model large-v3 for better accuracy.',
              file=sys.stderr)


if __name__ == '__main__':
    main()
