import Root from "#/lib/components/transitions/Root";
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
    <Root key={`page-${slug}`}>
      <MDXPage page={page} />
    </Root>
  );
}

export async function generateStaticParams() {
  const pages = await getRootPages();
  return pages.map((page) => ({ slug: page.slug }));
}
