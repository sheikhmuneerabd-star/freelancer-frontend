import { createContext, useState, useEffect } from "react";

export const themeDataContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <themeDataContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </themeDataContext.Provider>
  );
}

export default ThemeProvider;