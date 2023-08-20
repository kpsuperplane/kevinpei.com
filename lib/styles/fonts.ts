import { Shantell_Sans, REM, Source_Serif_4 } from "next/font/google";

const FUN = Shantell_Sans({
  subsets: ["latin"],
  variable: "--font-fun",
  display: "swap",
});

const SANS = REM({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const SERIF = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export default {
  FUN,
  SANS,
  SERIF,
};
