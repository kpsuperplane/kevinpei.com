import styles from "./page.module.scss";
import "./prism.css";

import { getMDXComponent } from "mdx-bundler/client";
import Image from "next/image";

import { Page } from "./data";
import { useMemo } from "react";
import Head from "next/head";

function numerify(input: string | number | undefined): number | undefined {
  if (typeof input === "string") {
    return Number(input);
  }
  return input;
}
const COMPONENTS = {
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <Image
      {...props}
      placeholder={undefined}
      height={numerify(props.height)}
      width={numerify(props.width)}
      src={props.src ?? ""}
      alt={props.alt ?? ""}
    />
  ),
};

export default function ({ page }: { page: Page }) {
  const MDXComponent = useMemo(() => getMDXComponent(page.code), [page.code]);
  return (
    <article className={styles.root}>
      <Head>
        <title>{page.title}</title>
        <meta name="description" content={page.subtitle} />
        <meta
          name="robots"
          content={page.published ? "all" : "noindex,nofollow"}
        />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.subtitle} />
      </Head>
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
      <MDXComponent components={COMPONENTS} />
    </article>
  );
}
