import styles from "./page.module.scss";
import "./prism.css";

import RehypePrism from "rehype-prism-plus";
import { MDXRemote } from "next-mdx-remote/rsc";
import RemarkGFM from "remark-gfm";

import { Page } from "./data";

const options = {
  mdxOptions: {
    remarkPlugins: [RemarkGFM],
    rehypePlugins: [[RehypePrism, { showLineNumbers: true }]],
  },
};

export default function ({ page }: { page: Page }) {
  return (
    <article className={styles.root}>
      <header>
        {page.date != null && (
          <h3 className={styles.dateline}>
            {page.date.toLocaleDateString("en-us", {
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: "UTC",
            })}
          </h3>
        )}
        <h1>{page.title}</h1>
        {page.subtitle != null && <h2>{page.subtitle}</h2>}
      </header>
      {/* @ts-expect-error Server Component */}
      <MDXRemote source={page.body} options={options} />
    </article>
  );
}
