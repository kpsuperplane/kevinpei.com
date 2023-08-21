"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCallback } from "react";

type Props = React.ComponentProps<typeof Link>;
export default function (props: Props) {
  const router = useRouter();

  const mountRef = useCallback((ref: HTMLAnchorElement | null) => {
    if (ref != null) {
      const sameSite =
        ref.href.startsWith("/") || ref.href.startsWith(window.location.origin);
      if (
        ref.target !== "_blank" &&
        sameSite &&
        !(
          "matchMedia" in window &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
      ) {
        ref.addEventListener("click", (e) => {
          const root = document.querySelector("#page-root");
          if (
            root != null &&
            "animate" in root &&
            ref.pathname !== window.location.pathname
          ) {
            router.prefetch(ref.href);
            e.preventDefault();
            e.stopImmediatePropagation();
            document.documentElement.classList.add("transition");
            root
              .animate(
                {
                  transform: "translateY(-10px)",
                  opacity: 0,
                },
                {
                  duration: 100,
                  easing: "cubic-bezier(0.5, 0, 0.75, 0)",
                  fill: "forwards",
                  iterations: 1,
                }
              )
              .addEventListener("finish", () => {
                router.push(ref.href);
              });
          }
        });
      }
    }
  }, []);
  return <Link {...props} ref={mountRef} />;
}
