"use client";
import { Sun, SunMoon, Moon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import styles from "./nav.module.scss";

enum Theme {
  DARK = "dark",
  LIGHT = "light",
  DEFAULT = "",
}

function getThemeInfo(theme: Theme) {
  switch (theme) {
    case Theme.DARK:
      return {
        Icon: Moon,
        status: "Dark",
      };
    case Theme.LIGHT:
      return {
        Icon: Sun,
        status: "Light",
      };
    case Theme.DEFAULT:
      return {
        Icon: SunMoon,
        status: "Default",
      };
  }
}

const STORAGE_KEY = "theme";

function getSavedTheme(): Theme {
  if (typeof window === "undefined") {
    return Theme.DEFAULT;
  }
  switch (window.localStorage.getItem(STORAGE_KEY)) {
    case Theme.DARK:
      return Theme.DARK;
    case Theme.LIGHT:
      return Theme.LIGHT;
    default:
      return Theme.DEFAULT;
  }
}

export default function () {
  const [theme, setTheme] = useState<Theme>(getSavedTheme());
  const { Icon, status } = getThemeInfo(theme);
  const nextTheme = useCallback(() => {
    const isDefaultDarkMode =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const order: Theme[] = isDefaultDarkMode
      ? [Theme.DEFAULT, Theme.LIGHT, Theme.DARK]
      : [Theme.DEFAULT, Theme.DARK, Theme.LIGHT];
    const currentIndex = order.findIndex((value) => value === theme);
    const newTheme = order[(currentIndex + 1) % order.length];
    window.localStorage.setItem(STORAGE_KEY, newTheme);
    setTheme(newTheme);
  }, [theme]);
  useEffect(() => {
    const html = document.documentElement;
    for (const option of Object.values(Theme)) {
      if (option === theme && option != Theme.DEFAULT) {
        html.classList.add(option);
      } else if (option != Theme.DEFAULT && html.classList.contains(option)) {
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
