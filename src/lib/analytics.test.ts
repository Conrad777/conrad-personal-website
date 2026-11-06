import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { clickTracking, initClickTracking, track } from "./analytics";

describe("analytics", () => {
  const capture = vi.fn();
  const info = vi.fn();

  beforeAll(() => {
    initClickTracking();
  });

  beforeEach(() => {
    (window as any).posthog = { capture, logger: { info } };
  });

  afterEach(() => {
    delete (window as any).posthog;
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  describe("track", () => {
    it("sends a tuple name as object:action", () => {
      track({
        name: ["theme_toggle", "click"],
        properties: { context: "appearance", theme: "dark" },
      });

      expect(capture).toHaveBeenCalledWith("theme_toggle:click", {
        context: "appearance",
        theme: "dark",
      });
      expect(info).toHaveBeenCalledWith("theme_toggle:click", {
        context: "appearance",
        theme: "dark",
      });
    });

    it("sends a string name as is", () => {
      track({
        name: "theme_toggle:click",
        properties: { context: "appearance", theme: "light" },
      });

      expect(capture).toHaveBeenCalledWith("theme_toggle:click", {
        context: "appearance",
        theme: "light",
      });
    });

    it("does nothing when PostHog is not loaded", () => {
      delete (window as any).posthog;

      expect(() =>
        track({
          name: ["social_profile_link", "click"],
          properties: { context: "social_profiles", platform: "github" },
        })
      ).not.toThrow();
    });

    it("rejects invalid events at compile time", () => {
      const invalid = () => {
        // @ts-expect-error unknown object
        track({ name: ["nope", "click"], properties: { context: "unknown" } });
        track({
          // @ts-expect-error action not registered for this object
          name: ["theme_toggle", "submit"],
          properties: { context: "appearance", theme: "dark" },
        });
        track({
          name: ["theme_toggle", "click"],
          // @ts-expect-error context is required
          properties: { theme: "dark" },
        });
        track({
          name: ["theme_toggle", "click"],
          // @ts-expect-error wrong property value
          properties: { context: "appearance", theme: "blue" },
        });
      };
      expect(invalid).toBeTypeOf("function");
    });
  });

  describe("clickTracking", () => {
    it("builds data attributes for the event", () => {
      expect(
        clickTracking({
          name: ["social_profile_link", "click"],
          properties: { context: "social_profiles", platform: "github" },
        })
      ).toEqual({
        "data-track": "social_profile_link:click",
        "data-track-properties":
          '{"context":"social_profiles","platform":"github"}',
      });
    });
  });

  describe("initClickTracking", () => {
    const render = (inner = "Github") => {
      const attributes = clickTracking({
        name: ["social_profile_link", "click"],
        properties: { context: "social_profiles", platform: "github" },
      });
      const link = document.createElement("a");
      link.href = "#";
      link.innerHTML = inner;
      for (const [key, value] of Object.entries(attributes)) {
        link.setAttribute(key, value);
      }
      document.body.append(link);
      return link;
    };

    it("tracks clicks on elements with data-track", () => {
      render().click();

      expect(capture).toHaveBeenCalledWith("social_profile_link:click", {
        context: "social_profiles",
        platform: "github",
      });
    });

    it("tracks clicks on children of elements with data-track", () => {
      render("<span>Github</span>").querySelector("span")!.click();

      expect(capture).toHaveBeenCalledWith("social_profile_link:click", {
        context: "social_profiles",
        platform: "github",
      });
    });

    it("ignores clicks on elements without data-track", () => {
      document.body.innerHTML = `<a href="#">Plain</a>`;

      document.querySelector("a")!.click();

      expect(capture).not.toHaveBeenCalled();
    });
  });
});
