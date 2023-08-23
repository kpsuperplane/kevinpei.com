import { bundleMDX } from "mdx-bundler";
import { cache } from "react";
import fs from "fs/promises";
import { join } from "path";
import RehypePrism from "rehype-prism-plus";
import RemarkGFM from "remark-gfm";
import RemarkMdxImages from "remark-mdx-images";

import ImageMetadataPlugin from "./ImageMetadataPlugin";
import { getMetadata } from "#/app/lib/metadata";

export type Page = Awaited<ReturnType<typeof getPage>>;

function nullthrows(value: string | null | undefined, name: string): string {
  if (typeof value === "string") {
    return value;
  }
  throw new Error(`Undefined property ${name}`);
}

const getPage = async (root: string, folder: string, slug: string) => {
  const cwd = join(process.cwd(), "./", root, folder, slug);
  const fileName = join(cwd, "page.mdx");
  const source = await fs.readFile(fileName, "utf8");
  const { code, frontmatter } = await bundleMDX({
    cwd,
    source,
    esbuildOptions: (options) => ({
      ...options,
      loader: {
        ...options.loader,
        ".jpg": "file",
        ".png": "file",
      },
      write: true,
      outdir: join(process.cwd(), "./public/generated"),
      publicPath: "/generated",
    }),
    mdxOptions: (options) => ({
      ...options,
      remarkPlugins: [
        ...(options.remarkPlugins ?? []),
        RemarkGFM,
        RemarkMdxImages,
        [ImageMetadataPlugin, { cwd }],
      ],
      rehypePlugins: [
        ...(options.rehypePlugins ?? []),
        [RehypePrism, { showLineNumbers: true }],
      ],
    }),
  });
  const dateStr = slug.match(/(\d\d\d\d-\d\d-\d\d)-.+/);
  const title = nullthrows(frontmatter.title, "title");
  const subtitle = frontmatter.subtitle as string | undefined;
  const published = frontmatter.published !== false;
  return {
    date: dateStr != null ? new Date(dateStr[1]) : undefined,
    title,
    subtitle,
    published,
    metadata: getMetadata(title, subtitle ?? "", {
      robots: published ? "all" : "noindex nofollow",
    }),
    uri: join(folder, slug),
    slug,
    code,
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
