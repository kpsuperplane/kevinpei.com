"use client";

import { useEffect } from "react";

export default function () {
  useEffect(() => {
    if (document.documentElement.classList.contains("transition")) {
      document.documentElement.classList.remove("transition");
      document.querySelector("#page-root")?.animate(
        [
          {
            transform: "translateY(30px)",
            opacity: 0,
          },
          {
            transform: "translateY(0px)",
            opacity: 1,
          },
        ],
        {
          duration: 300,
          easing: "cubic-bezier(0.25, 1, 0.5, 1)",
          fill: "forwards",
          iterations: 1,
        }
      );
    }
  }, []);
  return null;
}
