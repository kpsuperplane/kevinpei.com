import styled from "styled-components";

export default styled.a`
  color: #888;
  font-weight: 700;
  text-decoration: none;
  position: relative;
  transition: color 250ms;
  &:after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: #888;
    transform: scaleX(0);
    transition: transform 250ms;
  }
  &:hover {
    color: #444;
    &:after {
      transform: scaleX(1);
    }
  }
`;
