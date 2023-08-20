import { Metadata } from "next";
import styles from "./app.module.scss";
import { getRootPages } from "#/lib/mdx/data";
 
export const metadata: Metadata = {
  title: 'Kevin Pei',
}

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
  return <Section headline="Pins">

  </Section>;
}
