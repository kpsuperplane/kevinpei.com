import { Metadata } from "next";
import Head from "next/head";

import styles from "./app.module.scss";
import { Page, getPosts, getRootPages, isPublished } from "#/lib/mdx/data";
import Link from "#/lib/components/transitions/Link";
import TransitionIn from "#/lib/components/transitions/TransitionIn";

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
        {page.date != null && (
          <h4>
            {page.date.toLocaleDateString("en-us", {
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: "UTC",
            })}
          </h4>
        )}
        <h2>{page.title}</h2>
        {page.subtitle != null && <h3>{page.subtitle}</h3>}
      </article>
    </Link>
  );
}

export default async function () {
  const rootPages = await getRootPages();
  const posts = await getPosts();
  const title = "Kevin Pei";
  const subtitle = "A silly human who enjoys building cool things";
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={subtitle} />
        <meta name="robots" content="all" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={subtitle} />
      </Head>
      <div className={styles.root}>
        <Section headline="📌 Pins">
          {rootPages.map((page) => (
            <Article page={page} key={page.slug} />
          ))}
        </Section>
        <Section headline="🖋️ Posts">
          {posts.filter(isPublished).map((post) => (
            <Article page={post} key={post.slug} />
          ))}
        </Section>
      </div>
      <TransitionIn />
    </>
  );
}
