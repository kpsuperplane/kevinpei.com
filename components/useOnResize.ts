import { useEffect } from "react";

export default function useOnResize(callback: () => void) {
  useEffect(() => {
    const listener = () => {
      requestAnimationFrame(() => {
        callback();
      });
    };
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [callback]);
}
