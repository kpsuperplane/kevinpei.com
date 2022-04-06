import React from "react";
import styled from "styled-components";
import Image from "next/image";

import Logo from "./logo-black.png";

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: max(0px, calc(50vw - 400px));
  padding: 1rem;
  z-index: 2;
`;

export default function Nav() {
  return (
    <Wrapper>
      <Image src={Logo} alt="Logo" width={50} height={50} />
    </Wrapper>
  );
}
