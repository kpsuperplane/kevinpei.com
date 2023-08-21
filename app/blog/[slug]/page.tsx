import TransitionIn from "#/lib/components/transitions/TransitionIn";
import { getPost, getPosts } from "#/lib/mdx/data";
import MDXPage from "#/lib/mdx/Page";

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

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
