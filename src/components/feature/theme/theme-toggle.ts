import { logPostHogInteraction } from "../../../lib/posthog-logger";
import { applyTheme, getCurrentTheme, type Theme } from "./theme.util";

type PostHogWindow = Window & {
  posthog?: {
    capture: (event: string, properties?: Record<string, string>) => void;
  };
};

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
    (window as PostHogWindow).posthog?.capture("theme_preference_changed", {
      theme,
      trigger: "manual",
    });
    logPostHogInteraction("theme preference applied", {
      theme,
      trigger: "manual",
    });
  });

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", (event) => {
    const systemTheme = event.matches ? "dark" : "light";
    button.checked = themeToBoolean(systemTheme);
    applyTheme(systemTheme);
  });
}
