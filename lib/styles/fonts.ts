import { Shantell_Sans, REM } from "next/font/google";

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

export default {
  FUN,
  SANS,
};
