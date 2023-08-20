import styles from "./page.module.scss";
import { MDXRemote } from "next-mdx-remote/rsc";

import { Page } from "./data";

export default function ({ page }: { page: Page }) {
  return (
    <article className={styles.root}>
      <header>
        <h1>{page.title}</h1>
      </header>
      {/* @ts-expect-error Server Component */}
      <MDXRemote source={page.body} />
    </article>
  );
}
