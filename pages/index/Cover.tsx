import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import styled from "styled-components";
import { useWindowSize } from "@react-hook/window-size";
import { motion } from "framer-motion";

import coverImage from "../../assets/cover.jpg";
import Link from "../../components/Link";
import Middot from "../../components/Middot";

import useStaticRect from "../../components/useStaticRect";
import useOnScroll from "../../components/useOnScroll";
import useOnResize from "../../components/useOnResize";

const Wrapper = styled.div`
  height: 100vh;
  position: relative;
  display: flex;
  box-sizing: border-box;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  .image {
    @media (max-width: 600px) {
      object-position: 70% 50% !important;
    }
  }
`;

const WrapperInner = styled.div`
  flex: 1;
  display: flex;
  background: white;
  @media (max-width: 600px) {
    flex-direction: column-reverse;
    background: transparent;
    clip-path: none !important;
  }
`;

const LeftRail = styled.div`
  flex: 0 0 50%;
  position: relative;
  grid-column: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  @media (max-width: 600px) {
    background: white;
    flex: 0;
  }
`;

const Content = styled.div`
  padding: 2rem;
  flex: 0;
  width: 100%;
  max-width: calc(400px + 1rem);
  box-sizing: border-box;
  @media (max-width: 600px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: none;
    padding: 4rem 2rem 4rem 2rem;
  }
`;

const AnimSpan = styled.span`
  display: inline-block;
  transform-origin: top left;
`;

const Title = styled(motion.h1)`
  color: black;
  font-weight: 400;
  font-size: 2.5rem;
  margin-top: 0;
  @media (max-width: 600px) {
    text-align: center;
  }
`;

const AnimatedTitle = styled(motion.span)`
  display: inline-block;
  padding-right: 0.5rem;
  line-height: 1.2em;
  vertical-align: text-bottom;
  opacity: 0;
  flex: 0;
`;

const Name = styled(AnimatedTitle)`
  font-size: 4rem;
  font-weight: 900;
  font-family: Muli, sans-serif;
  padding-right: 0;
`;

const Links = styled(motion.div)`
  color: #999;
  opacity: 0;
`;

function easeInOutSine(x: number) {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

export default function Cover({
  loaded,
  setLoaded,
}: {
  loaded: boolean;
  setLoaded: (loaded: boolean) => void;
}) {
  const [width, height] = useWindowSize();

  const [firstLineRefCb, firstLineRect] = useStaticRect();
  const [secondLineRefCb, secondLineRect, secondLineRef] = useStaticRect();

  const innerWrapperRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const linksRef = useRef<HTMLDivElement | null>(null);

  const scrollCallback = useCallback(() => {
    const percent = easeInOutSine(
      Math.min(1, window.scrollY / (height * 0.9 || 1))
    );
    if (percent > 1) return;
    const offsetLeft =
      width / 2 -
      (firstLineRect?.width ?? 0 / 2) / 2 -
      (firstLineRect?.left ?? 0);
    const offsetTop = 10 + height - (firstLineRect?.top ?? 0);

    const secondOffsetLeft =
      (firstLineRect?.left ?? 0) +
      (firstLineRect?.width ?? 0) / 2 -
      ((secondLineRect?.width ?? 0) * 1.5) / 2 -
      (secondLineRect?.left ?? 0);

    console.log(firstLineRect, secondLineRect, secondOffsetLeft);

    if (innerWrapperRef.current != null) {
      innerWrapperRef.current.style.clipPath = `ellipse(100% 200% at ${
        -46 + percent * 50
      }% 50%)`;
    }
    if (titleRef.current != null) {
      titleRef.current.style.transform = `translate(${
        percent * offsetLeft
      }px, ${percent * offsetTop}px)`;
    }
    if (secondLineRef != null) {
      secondLineRef.style.transform = `
        translate(${percent * secondOffsetLeft}px, ${percent * 170}px) scale(${
        1 + percent * 0.5
      })
      `;
    }
    if (linksRef.current != null) {
      const linksPercent = Math.min(1, percent * 10);
      linksRef.current.style.opacity = `${1 - linksPercent}`;
      linksRef.current.style.transform = `translateY(${
        linksPercent *
        (firstLineRect?.height ?? 0 + (secondLineRect?.height ?? 0))
      }px)`;
      linksRef.current.style.pointerEvents = linksPercent === 1 ? "none" : "";
    }
  }, [
    firstLineRect?.height,
    firstLineRect?.left,
    firstLineRect?.top,
    firstLineRect?.width,
    height,
    secondLineRect?.height,
    secondLineRect?.left,
    secondLineRect?.width,
    secondLineRef,
    width,
  ]);

  useOnScroll(scrollCallback);
  useOnResize(scrollCallback);
  useEffect(scrollCallback, [scrollCallback]);

  return (
    <Wrapper>
      <Image
        className="image"
        src={coverImage}
        layout="fill"
        alt=""
        onLoadingComplete={() => setLoaded(true)}
        objectFit="cover"
        objectPosition="center"
      />
      <WrapperInner ref={innerWrapperRef}>
        <LeftRail>
          <Content>
            <Title ref={titleRef}>
              <AnimSpan ref={firstLineRefCb}>
                <AnimatedTitle
                  animate={
                    loaded
                      ? {
                          clipPath: "inset(0% 0% 0% 0%)",
                          y: "0rem",
                          opacity: 1,
                        }
                      : {
                          clipPath: "inset(0% 0% 100% 0%)",
                          y: "2rem",
                          opacity: 1,
                        }
                  }
                  initial={false}
                  transition={{ delay: 0.2, duration: 0.5, ease: "circOut" }}
                >
                  Hey there, I&rsquo;m
                </AnimatedTitle>
              </AnimSpan>
              <br />
              <AnimSpan ref={secondLineRefCb}>
                <Name
                  animate={
                    loaded
                      ? {
                          clipPath: "inset(0% 0% 0% 0%)",
                          y: "0rem",
                          opacity: 1,
                        }
                      : {
                          clipPath: "inset(0% 0% 100% 0%)",
                          y: "5rem",
                          opacity: 1,
                        }
                  }
                  initial={false}
                  transition={{ delay: 0.4, duration: 0.5, ease: "circOut" }}
                >
                  Kevin
                </Name>
              </AnimSpan>
            </Title>
            <div ref={linksRef}>
              <Links
                animate={
                  loaded
                    ? {
                        opacity: 1,
                      }
                    : { opacity: 0 }
                }
                initial={false}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <Link href="https://github.com/kpsuperplane">Github</Link>
                <Middot />
                <Link href="https://linkedin.com/in/kpsuperplane">
                  LinkedIn
                </Link>
                <Middot />
                <Link href="https://kevinpei.com/resume.pdf">Resume</Link>
              </Links>
            </div>
          </Content>
        </LeftRail>
      </WrapperInner>
    </Wrapper>
  );
}
