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
  /** Phosphor icon class without the `ph-` prefix. */
  icon: string;
}
