"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const getTheme = () => {
  const root = document.documentElement;
  return root.classList.contains("dark") ? "dark" : "light";
};

const applyTheme = (theme: "light" | "dark") => {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  window.localStorage.setItem("theme", theme);
};

export function ThemeToggle() {
  const toggleTheme = () => {
    const nextTheme = getTheme() === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="size-9 rounded-xl"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
    >
      <Sun className="hidden size-4 dark:block" />
      <Moon className="size-4 dark:hidden" />
    </Button>
  );
}
