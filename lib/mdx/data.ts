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
  const fileName = join("./app", folder, slug, "page.mdx");
  const fileContent = await fs.readFile(fileName);
  const { data, content } = matter(fileContent);
  return {
    title: nullthrows(data.title, "title"),
    subtitle: data.subtitle as string | undefined,
    uri: folder.replace("[slug]", slug),
    slug,
    body: content,
  };
};

const getPages = async (path: string) => {
  const rootPages = await fs.readdir(join("./app", path));
  return await Promise.all(
    rootPages
      .filter((name) => !name.includes("."))
      .map((name) => getPage(path, name))
  );
};

export const getRootPages = cache(async () => await getPages("[slug]"));
export async function getRootPage(slug: string) {
  const pages = await getRootPages();
  return pages.find((page) => page.slug === slug);
}

export const getPosts = cache(async () => await getPages("blog/[slug]"));
export async function getPost(slug: string) {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug);
}
