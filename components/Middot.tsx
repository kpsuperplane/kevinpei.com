import React from "react";
import styled from "styled-components";

const Wrapper = styled.span`
  pointer-events: none;
`;

export default function Middot() {
  return <Wrapper> &middot; </Wrapper>;
}
