import matter from "gray-matter";
import { cache } from "react";
import fs from "fs/promises";
import { join } from "path";

export type Page = Awaited<ReturnType<typeof getPage>>;

function nullthrows(value: string | null | undefined, name: string): string {
  if (typeof value === "string") {
    return value;
  }
  throw new Error(`Undefined property ${name}`);
}

const getPage = async (root: string, folder: string, slug: string) => {
  const fileName = join("./", root, folder, slug, "page.mdx");
  const fileContent = await fs.readFile(fileName);
  const { data, content } = matter(fileContent);
  const dateStr = slug.match(/(\d\d\d\d-\d\d-\d\d)-.+/);
  return {
    date: dateStr != null ? new Date(dateStr[1]) : undefined,
    title: nullthrows(data.title, "title"),
    subtitle: data.subtitle as string | undefined,
    published: data.published !== false,
    uri: join(folder, slug),
    slug,
    body: content,
  };
};

const getPages = async (root: string, path: string) => {
  const rootPages = await fs.readdir(join("./", root, path));
  return await Promise.all(
    rootPages
      .filter((name) => !name.includes("."))
      .map((name) => getPage(root, path, name))
  );
};

export const getRootPages = cache(async () => await getPages("pages", ""));
export async function getRootPage(slug: string) {
  const pages = await getRootPages();
  return pages.find((page) => page.slug === slug);
}

export const getPosts = cache(async () => await getPages("", "blog"));
export async function getPost(slug: string) {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug);
}

export function isPublished(page: Page) {
  return page.published;
}
