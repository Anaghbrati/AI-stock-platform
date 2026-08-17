"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="h-10 w-10 rounded-lg border border-white/10 bg-white/5 text-white"
      >
        ◐
      </button>
    );
  }

  function toggleTheme() {
    const newTheme = theme === "dark" ? "light" : "dark";

    console.log("Current theme:", theme);
    console.log("Changing to:", newTheme);

    setTheme(newTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}