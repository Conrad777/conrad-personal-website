import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { initThemeToggle } from "./theme-toggle";
import { applyTheme } from "./theme.util";

describe("initThemeToggle", () => {
  let matchMediaMock: any;
  let mediaQueryListeners: ((event: any) => void)[] = [];

  const createMatchMediaMock = (prefersDark: boolean) => {
    return vi.fn((query: string) => {
      const matches = query === "(prefers-color-scheme: dark)" && prefersDark;
      return {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event: string, listener: (event: any) => void) => {
          if (event === "change") {
            mediaQueryListeners.push(listener);
          }
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }) as any;
  };

  beforeEach(() => {
    localStorage.clear();

    document.documentElement.className = "";
    document.body.innerHTML = `
      <input id="theme-toggle" type="checkbox" />
    `;

    mediaQueryListeners = [];
    matchMediaMock = createMatchMediaMock(true);
    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Default theme initialization", () => {
    it.for`
      theme
      ${"dark"}
      ${"light"}
    `("should default to $theme theme when system prefers $theme", ({ theme }) => {
      window.matchMedia = createMatchMediaMock(theme === "dark");

      // Simulate theme-init.ts applying theme before initThemeToggle
      applyTheme();
      initThemeToggle();

      const button = document.getElementById("theme-toggle") as HTMLInputElement;
      expect(button.checked).toBe(theme === "light"); // false = dark, true = light
      expect(document.documentElement.classList.contains(theme)).toBe(true);
    });

    it("should use localStorage theme over system preference if available", () => {
      localStorage.setItem("theme", "light");
      window.matchMedia = createMatchMediaMock(true);

      // Simulate theme-init.ts applying theme before initThemeToggle
      applyTheme();
      initThemeToggle();

      const button = document.getElementById("theme-toggle") as HTMLInputElement;
      expect(button.checked).toBe(true); // Light from localStorage
      expect(document.documentElement.classList.contains("light")).toBe(true);
    });
  });

  describe("localStorage persistence", () => {
    it("should persist theme to localStorage when toggle button is changed", () => {
      initThemeToggle();

      const button = document.getElementById("theme-toggle") as HTMLInputElement;

      // Initially no theme in localStorage
      expect(localStorage.getItem("theme")).toBeNull();

      // Toggle to light
      button.checked = true;
      button.dispatchEvent(new Event("change"));

      expect(localStorage.getItem("theme")).toBe("light");
      expect(document.documentElement.classList.contains("light")).toBe(true);

      // Toggle to dark
      button.checked = false;
      button.dispatchEvent(new Event("change"));

      expect(localStorage.getItem("theme")).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("should persist theme when user changes system color scheme preference", () => {
      initThemeToggle();

      const button = document.getElementById("theme-toggle") as HTMLInputElement;

      // Simulate system preference change to dark
      expect(mediaQueryListeners.length).toBeGreaterThan(0);

      mediaQueryListeners.forEach((listener) => {
        listener({ matches: true }); // System now prefers dark
      });

      expect(localStorage.getItem("theme")).toBe("dark");
      expect(button.checked).toBe(false); // false = dark
      expect(document.documentElement.classList.contains("dark")).toBe(true);

      // Simulate system preference change to light
      mediaQueryListeners.forEach((listener) => {
        listener({ matches: false }); // System now prefers light
      });

      expect(localStorage.getItem("theme")).toBe("light");
      expect(button.checked).toBe(true); // true = light
      expect(document.documentElement.classList.contains("light")).toBe(true);
    });

    it("should update toggle button state when system preference changes", () => {
      window.matchMedia = createMatchMediaMock(false);

      initThemeToggle();

      const button = document.getElementById("theme-toggle") as HTMLInputElement;
      expect(button.checked).toBe(true); // Initially light

      // Simulate system preference change to dark
      mediaQueryListeners.forEach((listener) => {
        listener({ matches: true }); // System now prefers dark
      });

      expect(button.checked).toBe(false); // Should now be dark
    });
  });

  describe("Theme application", () => {
    it("should apply correct CSS classes when theme changes", () => {
      initThemeToggle();

      const button = document.getElementById("theme-toggle") as HTMLInputElement;

      // Set to light
      button.checked = true;
      button.dispatchEvent(new Event("change"));

      expect(document.documentElement.classList.contains("light")).toBe(true);
      expect(document.documentElement.classList.contains("dark")).toBe(false);

      // Set to dark
      button.checked = false;
      button.dispatchEvent(new Event("change"));

      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(document.documentElement.classList.contains("light")).toBe(false);
    });
  });
});
