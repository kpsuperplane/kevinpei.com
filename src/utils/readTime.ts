export function getReadTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1 / 60, words / 400);
}

/** Format a fractional minute value as M:SS (e.g. 2.75 → "2:45") */
export function formatDuration(minutes: number): string {
  const totalSec = Math.round(minutes * 60);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
