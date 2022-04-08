import { useEffect } from "react";

export default function useOnScroll(callback: (scrollY: number) => void) {
  useEffect(() => {
    const listener = () => {
      requestAnimationFrame(() => {
        callback(window.scrollY);
      });
    };
    window.addEventListener("scroll", listener);
    return () => window.removeEventListener("scroll", listener);
  }, [callback]);
}
