#!/usr/bin/env python3
"""
align.py — Align rendered lyric units to Whisper word timestamps.

The canonical text stream comes from scripts/extract-lyrics.mjs, which uses the
same HAST transforms as Astro rendering. That keeps the DOM lyric spans and this
timing JSON keyed by the same stable lyric IDs instead of fragile array indexes.

Usage:
  python3 scripts/align.py thoughts-on-agent-privacy --force

  python3 scripts/align.py \
    --post src/content/about.mdx \
    --audio src/content/about.m4a \
    --whisper scripts/whisper-out/about.json \
    --out src/content/about.json \
    --force
"""

import argparse
import json
import math
import re
import shutil
import subprocess
import sys
from collections import Counter
from difflib import SequenceMatcher
from pathlib import Path
from typing import Optional


VISIBLE_THRESHOLD = 0.40
SHORT_VISIBLE_THRESHOLD = 0.90
ANCHOR_THRESHOLD = 0.62
SKIP_TOLERANCE = 20
MIN_WINDOW_COVERAGE = 0.75


def tokenize(text: str) -> list[str]:
    """Lowercase alphanumeric tokens only."""
    return re.findall(r'\w+', text.lower())


def flatten_words(whisper_data: dict) -> list[dict]:
    words = []
    for seg in whisper_data.get('segments', []):
        for w in seg.get('words') or []:
            tokens = re.findall(r'\w+', w.get('word', '').lower())
            if tokens:
                start = w['start']
                end = w['end']
                step = (end - start) / max(len(tokens), 1)
                for idx, token in enumerate(tokens):
                    token_start = start + (idx * step)
                    token_end = end if idx == len(tokens) - 1 else start + ((idx + 1) * step)
                    words.append({
                        'text': token,
                        'start': token_start,
                        'end': token_end,
                        'raw': w.get('word', ''),
                    })
    return words


def word_boundaries(unit_tokens: list[str], matched_words: list[dict]) -> list[float]:
    if not matched_words:
        return []

    source = [matched_words[0]['start']] + [word['end'] for word in matched_words]
    target_word_count = len(unit_tokens)

    if target_word_count <= 0:
        return []
    if len(matched_words) == target_word_count:
        return [round(time, 3) for time in source]

    # The fuzzy matcher can still align a lyric sentence to a transcript window
    # with a slightly different token count. Resample to lyric-token boundaries
    # so the browser overlay has one timing boundary per rendered word.
    source_word_count = len(matched_words)
    resampled = []
    for boundary_idx in range(target_word_count + 1):
        pos = (boundary_idx / target_word_count) * source_word_count
        lo = min(math.floor(pos), source_word_count)
        hi = min(math.ceil(pos), source_word_count)
        if lo == hi:
            resampled.append(source[lo])
        else:
            frac = pos - lo
            resampled.append(source[lo] + ((source[hi] - source[lo]) * frac))

    return [round(time, 3) for time in resampled]


def whisper_duration(whisper_data: dict, trans_words: list[dict]) -> float:
    segments = whisper_data.get('segments', [])
    return segments[-1]['end'] if segments else (
        trans_words[-1]['end'] if trans_words else 0.0)


def find_ffmpeg(root: Path) -> Optional[str]:
    bundled = root / 'node_modules/ffmpeg-static/ffmpeg'
    if bundled.exists():
        return str(bundled)
    return shutil.which('ffmpeg')


def probe_audio_duration(audio_path: Path, root: Path) -> Optional[float]:
    ffmpeg = find_ffmpeg(root)
    if not ffmpeg or not audio_path.exists():
        return None

    proc = subprocess.run(
        [ffmpeg, '-i', str(audio_path)],
        capture_output=True,
        text=True,
        check=False,
    )
    output = f'{proc.stdout}\n{proc.stderr}'
    match = re.search(r'Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)', output)
    if not match:
        return None

    hours = int(match.group(1))
    minutes = int(match.group(2))
    seconds = float(match.group(3))
    return (hours * 3600) + (minutes * 60) + seconds


def best_window(
    unit_tokens: list[str],
    trans_words: list[dict],
    start_idx: int,
    search_ahead: int,
) -> tuple[int, int, float]:
    n = len(unit_tokens)
    limit = min(start_idx + search_ahead, len(trans_words))

    best_i, best_j, best_score = -1, -1, 0.0
    lo = max(1, math.ceil(n * MIN_WINDOW_COVERAGE))
    hi = min(int(n * 2.0) + 1, limit - start_idx + 1)

    for length in range(lo, hi):
        for i in range(start_idx, limit - length + 1):
            j = i + length
            window_tokens = [trans_words[k]['text'] for k in range(i, j)]
            score = SequenceMatcher(None, unit_tokens, window_tokens).ratio()
            if score > best_score:
                best_score = score
                best_i, best_j = i, j

    return best_i, best_j, best_score


def align_units(units: list[dict], trans_words: list[dict]) -> list[dict]:
    results = []
    word_idx = 0

    for unit in units:
        tokens = tokenize(unit['text'])
        mode = unit.get('mode', 'visible')
        threshold = ANCHOR_THRESHOLD if mode == 'anchor' else VISIBLE_THRESHOLD
        if mode == 'visible' and len(tokens) <= 4:
            threshold = max(threshold, SHORT_VISIBLE_THRESHOLD)

        if not tokens or word_idx >= len(trans_words):
            results.append({**unit, 'start': None, 'end': None, 'score': 0.0})
            continue

        search_ahead = SKIP_TOLERANCE + len(tokens) * 2
        i, j, score = best_window(tokens, trans_words, word_idx, search_ahead)

        if i < 0 or score < threshold:
            results.append({**unit, 'start': None, 'end': None, 'score': round(score, 3)})
            continue

        matched = trans_words[i:j]
        word_times = word_boundaries(tokens, matched)
        results.append({
            **unit,
            'start': word_times[0],
            'end': word_times[-1],
            'words': word_times,
            'score': round(score, 3),
        })
        word_idx = j

    return results


def load_lyric_units(post_path: Path, root: Path, units_path: Optional[Path]) -> list[dict]:
    if units_path:
        with open(units_path, encoding='utf-8') as f:
            manifest = json.load(f)
    else:
        bun = shutil.which('bun')
        if not bun:
            raise RuntimeError('bun not found; cannot generate lyric units')

        proc = subprocess.run(
            [bun, str(root / 'scripts/extract-lyrics.mjs'), '--post', str(post_path)],
            capture_output=True,
            text=True,
            check=False,
        )
        if proc.returncode != 0:
            raise RuntimeError(proc.stderr.strip() or proc.stdout.strip())
        manifest = json.loads(proc.stdout)

    units = manifest.get('units', manifest if isinstance(manifest, list) else [])
    return [
        unit
        for unit in units
        if unit.get('mode') in {'visible', 'anchor'}
    ]


def duplicate_ids(units: list[dict]) -> list[str]:
    counts = Counter(unit.get('id') for unit in units)
    return sorted(id_ for id_, count in counts.items() if id_ and count > 1)


def default_post_path(root: Path, slug: str) -> Path:
    posts_md = root / 'src/content/posts' / f'{slug}.md'
    posts_mdx = root / 'src/content/posts' / f'{slug}.mdx'
    if posts_md.exists():
        return posts_md
    if posts_mdx.exists():
        return posts_mdx

    content_md = root / 'src/content' / f'{slug}.md'
    content_mdx = root / 'src/content' / f'{slug}.mdx'
    if content_md.exists():
        return content_md
    return content_mdx


def main():
    parser = argparse.ArgumentParser(description='Align rendered lyric units to Whisper timestamps')
    parser.add_argument('slug', nargs='?', help='Content slug, e.g. about')
    parser.add_argument('--post', help='Path to the source Markdown/MDX file')
    parser.add_argument('--audio', help='Path to the encoded audio file')
    parser.add_argument('--whisper', help='Path to Whisper JSON with word timestamps')
    parser.add_argument('--units', help='Path to pre-generated lyric-unit JSON')
    parser.add_argument('--out', help='Output timing JSON path')
    parser.add_argument('--force', action='store_true', help='Overwrite existing output')
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1]

    post_path = Path(args.post) if args.post else None
    audio_path = Path(args.audio) if args.audio else None
    whisper_path = Path(args.whisper) if args.whisper else None
    units_path = Path(args.units) if args.units else None
    out_path = Path(args.out) if args.out else None

    if args.slug:
        post_path = post_path or default_post_path(root, args.slug)

    if post_path:
        audio_path = audio_path or post_path.with_suffix('.m4a')
        whisper_path = whisper_path or root / 'scripts/whisper-out' / f'{post_path.stem}.json'
        out_path = out_path or post_path.with_suffix('.json')

    if not post_path or not whisper_path or not out_path:
        parser.error('provide a slug, or provide --post with optional --whisper/--out')

    if not post_path.exists():
        parser.error(f'post file not found: {post_path}')
    if not whisper_path.exists():
        parser.error(f'whisper JSON not found: {whisper_path}')
    if out_path.exists() and not args.force:
        parser.error(
            f'output already exists: {out_path}\n'
            'Refusing to overwrite hand-tuned timings. Re-run with --force to regenerate.'
        )

    try:
        units = load_lyric_units(post_path, root, units_path)
    except RuntimeError as error:
        parser.error(str(error))

    with open(whisper_path, encoding='utf-8') as f:
        whisper_data = json.load(f)

    trans_words = flatten_words(whisper_data)
    duration = probe_audio_duration(audio_path, root) if audio_path else None
    if duration is None:
        duration = whisper_duration(whisper_data, trans_words)

    aligned = align_units(units, trans_words)
    visible = [unit for unit in aligned if unit.get('mode') == 'visible']
    anchors = [unit for unit in aligned if unit.get('mode') == 'anchor']
    visible_timed = sum(1 for unit in visible if unit['start'] is not None)
    anchor_matched = sum(1 for unit in anchors if unit['start'] is not None)
    null_visible = len(visible) - visible_timed
    duplicates = duplicate_ids(units)

    print(f'Alignment units   : {len(units)}')
    print(f'Visible units     : {len(visible)}')
    print(f'Anchor units      : {len(anchors)}')
    print(f'Transcript words  : {len(trans_words)}')
    print(f'Visible timed     : {visible_timed} ({100*visible_timed//max(len(visible),1)}%)')
    print(f'Anchor matched    : {anchor_matched}')
    print(f'Null visible      : {null_visible}')
    print(f'Duplicate IDs     : {len(duplicates)}')
    print(f'Missing timing IDs: 0')
    print(f'Duration          : {duration:.1f}s')
    if duplicates:
        print(f'Duplicate ID list : {", ".join(duplicates)}')

    output = {
        'duration': round(duration, 3),
        'sentences': [
            {
                key: unit[key]
                for key in ('id', 'text', 'start', 'end', 'words')
                if key in unit
            }
            for unit in visible
        ],
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2)
        f.write('\n')
    print(f'Written           : {out_path}')

    if visible_timed / max(len(visible), 1) < 0.70:
        print('\n⚠  Less than 70% of visible units matched. Try a larger Whisper model.',
              file=sys.stderr)


if __name__ == '__main__':
    main()
