import { getCollection, type CollectionEntry } from 'astro:content';

type PostEntry = CollectionEntry<'posts'>;

const postModules = import.meta.glob('../content/posts/*.{md,mdx}');

function hasPostFiles(): boolean {
  return Object.keys(postModules).length > 0;
}

export async function getPosts(): Promise<PostEntry[]> {
  if (!hasPostFiles()) return [];
  return getCollection('posts');
}

export async function getPostsReverseChronological(): Promise<PostEntry[]> {
  const posts = await getPosts();
  return posts.toSorted((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const getSortedPosts = getPostsReverseChronological;
