import { Metadata } from "next";

import TransitionIn from "#/lib/components/transitions/TransitionIn";
import { getRootPage, getRootPages } from "#/lib/mdx/data";
import MDXPage from "#/lib/mdx/Page";

type Props = {
  params: {
    slug: string;
  };
};
export default async function Page({ params: { slug } }: Props) {
  const page = await getRootPage(slug);
  if (page == null) {
    throw new Error(`Can't fetch page for slug ${slug}`);
  }
  return (
    <>
      <TransitionIn />
      <MDXPage page={page} />
    </>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getRootPage(params.slug);
  return post!.metadata;
}

export async function generateStaticParams() {
  const pages = await getRootPages();
  return pages.map((page) => ({ slug: page.slug }));
}
