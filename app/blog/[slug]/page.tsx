import { Metadata } from "next";

import TransitionIn from "#/app/lib/components/transitions/TransitionIn";
import { getPost, getPosts } from "#/app/lib/mdx/data";
import MDXPage from "#/app/lib/mdx/Page";

type Props = {
  params: {
    slug: string;
  };
};
export default async function Post({ params: { slug } }: Props) {
  const post = await getPost(slug);
  if (post == null) {
    throw new Error(`Can't fetch post for slug ${slug}`);
  }
  return (
    <>
      <TransitionIn />
      <MDXPage page={post} />
    </>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  return post!.metadata;
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
