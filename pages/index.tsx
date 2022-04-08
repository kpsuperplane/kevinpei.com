import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import useOnLoad from "../components/useOnLoad";
import Content from "./index/Content";
import Cover from "./index/Cover";

const Home: NextPage = () => {
  const [pageLoaded, setPageLoaded] = useState(false);
  const [coverLoaded, setCoverLoaded] = useState(false);

  const onLoad = useCallback(() => setPageLoaded(true), []);
  useOnLoad(onLoad);

  const loaded = pageLoaded && coverLoaded;

  return (
    <>
      <Head>
        <title>Kevin Pei</title>
        <meta name="description" content="Learning to adult." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Cover loaded={loaded} setLoaded={setCoverLoaded} />
      <Content />
    </>
  );
};

export default Home;
