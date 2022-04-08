import { useEffect } from "react";

export default function useOnLoad(callback: () => void) {
  useEffect(() => {
    const onLoad = () => callback();
    window.addEventListener("load", onLoad);
    if (document.readyState === "complete") {
      callback();
    }
    return () => {
      window.removeEventListener("load", onLoad);
    };
  }, [callback]);
}
