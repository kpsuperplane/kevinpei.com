import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styled from "styled-components";
import coverImage from "../assets/cover.jpg";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Cover = styled(motion.div)`
  width: 100vw;
  height: 100vh;
  position: relative;
  display: grid;
  justify-content: center;
  align-content: center;
  grid-template-columns: 1fr min(400px, 100vw/2) 50%;
`;

const Content = styled.div`
  position: relative;
  padding: 2rem;
  grid-column: 2;
`;

const Title = styled(motion.h1)`
  color: white;
  font-weight: 400;
  font-size: 2rem;
`;

const AnimatedTitle = styled(motion.span)`
  display: block;
`;

const Name = styled(AnimatedTitle)`
  font-size: 5rem;
  font-weight: 900;
  font-family: Muli, sans-serif;
  display: block;
`;

const Home: NextPage = () => {
  const [pageLoaded, setPageLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const onLoad = () => setPageLoaded(true);
    window.addEventListener("load", onLoad);
    if (document.readyState === "complete") {
      setPageLoaded(true);
    }
    return () => {
      window.removeEventListener("load", onLoad);
    };
  }, []);

  const loaded = pageLoaded && imageLoaded;

  return (
    <>
      <Head>
        <title>Kevin Pei</title>
        <meta name="description" content="Learning to adult." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Cover
        animate={{
          clipPath: loaded
            ? "circle(100% at 50% 50%)"
            : "circle(0% at 50% 50%)",
        }}
        initial={false}
        transition={{ duration: 0.8 }}
      >
        <Image
          src={coverImage}
          layout="fill"
          alt=""
          onLoadingComplete={() => setImageLoaded(true)}
          objectFit="cover"
          objectPosition="center"
        />
        <Content>
          <Title>
            <AnimatedTitle
              animate={
                loaded
                  ? {
                      clipPath: "inset(0% 0% 0% 0%)",
                      y: "0rem",
                    }
                  : {
                      clipPath: "inset(0% 0% 100% 0%)",
                      y: "2rem",
                    }
              }
              initial={false}
              transition={{ delay: 0.4, duration: 0.5, ease: "circOut" }}
            >
              Hey there, I&rsquo;m
            </AnimatedTitle>
            <Name
              animate={
                loaded
                  ? {
                      clipPath: "inset(0% 0% 0% 0%)",
                      y: "0rem",
                    }
                  : {
                      clipPath: "inset(0% 0% 100% 0%)",
                      y: "5rem",
                    }
              }
              initial={false}
              transition={{ delay: 0.5, duration: 0.5, ease: "circOut" }}
            >
              Kevin
            </Name>
          </Title>
        </Content>
      </Cover>
    </>
  );
};

export default Home;
