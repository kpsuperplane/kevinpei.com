import { Metadata } from "next";
import Link from "next/link";

import styles from "./app.module.scss";
import { getRootPages } from "#/lib/mdx/data";
 
export const metadata: Metadata = {
  title: 'Kevin Pei',
};

type SectionProps = {
  headline: string,
  children: React.ReactNode,
};
function Section({headline, children}: SectionProps) {
  return (
    <section className={styles.section}>
      <header>
        <h1>{headline}</h1>
      </header>
      {children}
    </section>
  );
}
  
export default async function () {
  const rootPages = await getRootPages();
  return (
    <div className={styles.root}>
      <Section headline="📌 Pins">
        {rootPages.map(({title, slug}) => (
          <Link href={`/${slug}`}>
            <article>
              <h2>{title}</h2>
            </article>
          </Link>
        ))}
      </Section>
      <Section headline="🖋️ Posts">
        Hello
      </Section>
    </div>
  );
}
