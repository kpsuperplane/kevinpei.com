/**
 * Convert a human-readable tag to a URL slug. Single source of truth so
 * URL generation and active-state matching always agree on casing.
 */
export function tagToSlug(tag: string): string {
  return tag.toLowerCase();
}

/**
 * Build the full tag page path for a given tag name.
 */
export function tagPath(tag: string): string {
  return `/tags/${tagToSlug(tag)}`;
}
