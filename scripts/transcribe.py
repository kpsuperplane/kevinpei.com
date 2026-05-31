#!/usr/bin/env python3
"""
transcribe.py — Generate faster-whisper JSON with word timestamps.

Usage:
  python scripts/transcribe.py src/content/about.m4a
"""

import argparse
import json
from pathlib import Path

from faster_whisper import WhisperModel


def main():
    parser = argparse.ArgumentParser(
        description='Transcribe audio with faster-whisper word timestamps')
    parser.add_argument('audio', help='Path to an audio file')
    parser.add_argument('--out', help='Output Whisper JSON path')
    parser.add_argument('--model', default='small', help='Whisper model size/name')
    parser.add_argument('--language', default='en', help='Spoken language')
    args = parser.parse_args()

    audio_path = Path(args.audio)
    root = Path(__file__).resolve().parents[1]
    out_path = Path(args.out) if args.out else root / 'scripts/whisper-out' / f'{audio_path.stem}.json'

    if not audio_path.exists():
        parser.error(f'audio file not found: {audio_path}')

    model = WhisperModel(args.model, device='auto', compute_type='int8')
    segments_iter, info = model.transcribe(
        str(audio_path),
        language=args.language,
        word_timestamps=True,
        vad_filter=True,
    )

    segments = []
    for segment in segments_iter:
        segments.append({
            'id': segment.id,
            'start': round(segment.start, 3),
            'end': round(segment.end, 3),
            'text': segment.text,
            'words': [
                {
                    'word': word.word,
                    'start': round(word.start, 3),
                    'end': round(word.end, 3),
                }
                for word in (segment.words or [])
            ],
        })

    out = {
        'language': info.language,
        'duration': round(info.duration, 3),
        'segments': segments,
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=2)
        f.write('\n')

    print(f'Transcribed {audio_path} → {out_path}')
    print(f'Segments: {len(segments)}')


if __name__ == '__main__':
    main()
