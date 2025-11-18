export type Theme = "light" | "dark";

function getSystemTheme() {
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function getCurrentTheme() {
  return localStorage.getItem("theme") ?? getSystemTheme();
}

export function applyTheme(theme?: Theme) {
  const currentTheme = theme ?? getCurrentTheme();

  const html = document.documentElement;

  html.classList.remove("light", "dark");
  html.classList.add(currentTheme);

  // only persist the theme if you explicitly passed one
  if (theme) {
    localStorage.setItem("theme", theme);
  }
}
