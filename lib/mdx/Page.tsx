import styles from "./page.module.scss";
import rehypeHighlight from "rehype-highlight";
import { MDXRemote } from "next-mdx-remote/rsc";

import { Page } from "./data";

const options = {
  mdxOptions: {
    remarkPlugins: [],
    rehypePlugins: [rehypeHighlight],
  },
};

export default function ({ page }: { page: Page }) {
  return (
    <article className={styles.root}>
      <header>
        <h1>{page.title}</h1>
        {page.subtitle != null && <h2>{page.subtitle}</h2>}
      </header>
      {/* @ts-expect-error Server Component */}
      <MDXRemote source={page.body} options={options} />
    </article>
  );
}
