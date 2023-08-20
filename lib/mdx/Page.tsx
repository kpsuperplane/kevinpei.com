import styles from "./page.module.scss";
import { MDXRemote } from "next-mdx-remote/rsc";

import { Page } from "./data";

export default function ({ page }: { page: Page }) {
  return (
    <article>
      <h1>{page.title}</h1>
      {/* @ts-expect-error Server Component */}
      <MDXRemote source={page.body} />
    </article>
  );
}
