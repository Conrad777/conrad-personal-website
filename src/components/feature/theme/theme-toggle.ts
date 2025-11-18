import { applyTheme, getCurrentTheme, type Theme } from "./theme.util";

const themeToBoolean = (theme: Theme) => theme === "light";
const booleanToTheme = (checked: boolean) => (checked ? "light" : "dark");

export function initThemeToggle() {
  const button = document.getElementById("theme-toggle") as HTMLInputElement;
  const currentTheme = getCurrentTheme();

  button.checked = themeToBoolean(currentTheme);

  button.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement;
    const theme = booleanToTheme(target?.checked);
    applyTheme(theme);
  });

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", (event) => {
    const systemTheme = event.matches ? "dark" : "light";
    button.checked = themeToBoolean(systemTheme);
    applyTheme(systemTheme);
  });
}
