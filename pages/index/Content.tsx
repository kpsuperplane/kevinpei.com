import React from "react";
import styled from "styled-components";
import Image from "next/image";

import lineKevin from "../../assets/linekevin.png";

const Wrapper = styled.div`
  height: 1200px;
`;

const LineKevin = styled.div`
  text-align: center;
  padding-top: 2rem;
`;

export default function Content() {
  return (
    <Wrapper>
      <LineKevin>
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
