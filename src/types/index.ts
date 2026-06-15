/**
 * Shape of a post returned from Astro's `getCollection('posts')`.
 * We deliberately keep this narrow — only the fields we actually use.
 */
export interface Post {
  id: string;
  body?: string;
  data: {
    title: string;
    date: Date;
    readTime?: number;
    description?: string;
  };
}

export interface NavLink {
  href: string;
  label: string;
  /** Path under /public for an image icon. If omitted, falls back to `iconChar`. */
  iconSrc?: string;
  /** Text glyph fallback when no image is provided. */
  iconChar?: string;
}
