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

const getPage = async (folder: string, slug: string) => {
  const fileName = join(folder, slug, "page.mdx");
  const fileContent = await fs.readFile(fileName);
  const { data, content } = matter(fileContent);
  return { title: nullthrows(data.title, "title"), slug, body: content };
};

const getPages = async (path: string) => {
  const rootPages = await fs.readdir(path);
  return await Promise.all(
    rootPages
      .filter((name) => !name.includes("."))
      .map((name) => getPage(path, name))
  );
};

export const getRootPages = cache(async () => await getPages("./app/[slug]"));
export async function getRootPage(slug: string) {
  const pages = await getRootPages();
  return pages.find((page) => page.slug === slug);
}

export const getPosts = cache(async () => await getPages("./app/blog/[slug]"));
export async function getPost(slug: string) {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug);
}
