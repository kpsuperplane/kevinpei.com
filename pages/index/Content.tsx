import React, { useCallback, useState } from "react";
import styled from "styled-components";
import Image from "next/image";

import lineKevin from "../../assets/linekevin.png";
import { motion } from "framer-motion";
import { useWindowSize } from "@react-hook/window-size";
import useOnScroll from "../../components/useOnScroll";

const Wrapper = styled.div`
  height: 1200px;
`;

const LineKevin = styled(motion.div)`
  text-align: center;
  padding-top: 1.5rem;
`;

export default function Content() {
  const [_, height] = useWindowSize();
  const [kevinInView, setKevinInView] = useState(false);

  const onScroll = useCallback(() => {
    const inView = window.scrollY / (height * 0.9 || 1) > 0.9;
    if (inView !== kevinInView) {
      setKevinInView(inView);
    }
  }, [height, kevinInView]);

  useOnScroll(onScroll);

  return (
    <Wrapper>
      <LineKevin
        animate={
          kevinInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }
        }
        transition={{ duration: 0.5 }}
      >
        <Image
          src={lineKevin}
          height={250}
          width={250}
          alt="Photo of Kevin Pei"
        />
      </LineKevin>
    </Wrapper>
  );
}
