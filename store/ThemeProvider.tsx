"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Default theme handler for when used outside provider
const handleThemeChange = (newTheme: Theme) => {
  if (typeof window === "undefined") return;

  localStorage.setItem("theme", newTheme);
  const root = document.documentElement;

  root.classList.remove("light-mode", "dark-mode");

  if (newTheme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    root.classList.add(`${systemTheme}-mode`);
  } else {
    root.classList.add(`${newTheme}-mode`);
  }

  root.setAttribute("data-theme", newTheme);
};

// Safe hook version that doesn't throw errors
export function useSafeTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    // We're outside the provider, return a fallback implementation
    const [localTheme, setLocalTheme] = useState<Theme>(
      typeof window !== "undefined"
        ? (localStorage.getItem("theme") as Theme) || "system"
        : "system"
    );

    const setTheme = (newTheme: Theme) => {
      setLocalTheme(newTheme);
      handleThemeChange(newTheme);
    };

    useEffect(() => {
      if (typeof window !== "undefined") {
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
          setLocalTheme(savedTheme);
          handleThemeChange(savedTheme);
        }
      }
    }, []);

    return { theme: localTheme, setTheme };
  }

  return context;
}

// Original hook for when you know component is within provider
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
        setTheme(savedTheme);
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    handleThemeChange(theme);
  }, [theme, mounted]);

  // Set up listener for system theme changes
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        const root = document.documentElement;
        root.classList.remove("light-mode", "dark-mode");
        root.classList.add(mediaQuery.matches ? "dark-mode" : "light-mode");
      }
    };

    // Initial setup
    handleChange();

    // Add listener for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      // For older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme, mounted]);

  const value = { theme, setTheme };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
