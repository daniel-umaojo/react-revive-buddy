"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";

// ✅ Provider (no need to manage localStorage or classes manually)
export function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // or a loader/spinner
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="dark"   // can be "system", "dark", or "light"
      enableSystem={false}   // disable system preference if you want manual toggle only
    >
      {children}
    </NextThemeProvider>
  );
}

// ✅ Hook wrapper (so you can call useTheme like your old version)
export const useTheme = () => {
  const { theme, setTheme } = useNextTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return { theme, toggleTheme };
};
