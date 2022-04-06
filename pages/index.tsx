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
  align-content: stretch;
  grid-template-columns: 60% 40%;
`;

const LeftRail = styled.div`
  clip-path: ellipse(50% 100% at 40% 50%);
  padding-right: 10vw;
  background: white;
  position: relative;
  grid-column: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
`;

const Content = styled.div`
  padding: 2rem;
  flex: 0;
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
`;

const Title = styled(motion.h1)`
  color: black;
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
        <LeftRail>
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
        </LeftRail>
      </Cover>
    </>
  );
};

export default Home;
