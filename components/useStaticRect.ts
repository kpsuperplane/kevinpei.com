import { useCallback, useEffect, useState } from "react";

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};
export default function useStaticRect(): [
  (el: HTMLElement) => void,
  Rect | null,
  HTMLElement | undefined
] {
  const [ref, setRef] = useState<HTMLElement>();
  const [rect, setRect] = useState<Rect | null>(null);
  const computeRef = useCallback(() => {
    if (ref != null) {
      let el: HTMLElement | undefined = ref,
        left = 0,
        top = 0;
      while (el != null) {
        left += el.offsetLeft;
        top += el.offsetTop;
        el = el.offsetParent as HTMLElement | undefined;
      }
      setRect({
        top,
        left,
        width: ref?.offsetWidth,
        height: ref?.offsetHeight,
      });
    }
  }, [ref]);
  const cb = useCallback((el: HTMLElement) => setRef(el), [setRef]);
  useEffect(() => {
    const onResize = () => computeRef();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [computeRef]);
  useEffect(computeRef, [computeRef]);
  return [cb, rect, ref];
}
