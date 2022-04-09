import type { AppProps } from "next/app";
import { createGlobalStyle } from "styled-components";
import Nav from "../components/Nav";

const GlobalStyle = createGlobalStyle`
  body, html {
    margin: 0;
    padding: 0;
    font-family: Muli, sans-serif;
    font-size: 14px;
  }
  h1, h2, h3, h4, h5, h6 {
      font-family: 'Noto Serif Display', serif;
  }
`;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <GlobalStyle />
      <Nav />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
