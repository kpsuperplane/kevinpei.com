"use client";
import { Sun, SunMoon, Moon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import styles from "./nav.module.scss";

type Theme = "dark" | "light" | null;
const THEME_ARRAY: Theme[] = ["dark", "light", null];

function getThemeInfo(theme: Theme) {
  switch (theme) {
    case "dark":
      return {
        Icon: Moon,
        status: "Dark",
      };
    case "light":
      return {
        Icon: Sun,
        status: "Light",
      };
    case null:
      return {
        Icon: SunMoon,
        status: "Default",
      };
  }
}

export default function () {
  const [theme, setTheme] = useState<Theme>(null);
  const { Icon, status } = getThemeInfo(theme);
  const nextTheme = useCallback(() => {
    const isDefaultDarkMode =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const order: Theme[] = isDefaultDarkMode
      ? [null, "light", "dark"]
      : [null, "dark", "light"];
    const currentIndex = order.findIndex((value) => value === theme);
    setTheme(order[(currentIndex + 1) % order.length]);
  }, [theme]);
  useEffect(() => {
    const html = document.documentElement;
    for (const option of THEME_ARRAY) {
      if (option === theme && option != null) {
        html.classList.add(option);
      } else if (option != null && html.classList.contains(option)) {
        html.classList.remove(option);
      }
    }
  }, [theme]);
  return (
    <button
      aria-label="Change website theme"
      aria-description={`Currently selected: ${status}`}
      onClick={nextTheme}
      className={styles.toggle}
    >
      <Icon size="1em" strokeWidth={2} />
    </button>
  );
}
