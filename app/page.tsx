import { Metadata } from "next";

import styles from "./app.module.scss";
import { Page, getPosts, getRootPages } from "#/lib/mdx/data";
import Root from "#/lib/components/transitions/Root";
import Link from "#/lib/components/transitions/Link";

export const metadata: Metadata = {
  title: "Kevin Pei",
};

type SectionProps = {
  headline: string;
  children: React.ReactNode;
};
function Section({ headline, children }: SectionProps) {
  return (
    <section className={styles.section}>
      <header>
        <h1>{headline}</h1>
      </header>
      {children}
    </section>
  );
}

function Article({ page }: { page: Page }) {
  return (
    <Link href={`/${page.uri}`}>
      <article>
        <h2>{page.title}</h2>
        {page.subtitle != null && <h3>{page.subtitle}</h3>}
      </article>
    </Link>
  );
}

export default async function () {
  const rootPages = await getRootPages();
  const posts = await getPosts();
  return (
    <Root className={styles.root} key="home">
      <Section headline="📌 Pins">
        {rootPages.map((page) => (
          <Article page={page} key={page.slug} />
        ))}
      </Section>
      <Section headline="🖋️ Posts">
        {posts.map((post) => (
          <Article page={post} key={post.slug} />
        ))}
      </Section>
    </Root>
  );
}
