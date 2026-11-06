// @ts-check

import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import icon from "astro-icon";

export default defineConfig({
  site: "https://conradholtzhausen.com",
  vite: {
    plugins: [tailwindcss(), svgr()],
  },

  integrations: [react(), icon()],
});
