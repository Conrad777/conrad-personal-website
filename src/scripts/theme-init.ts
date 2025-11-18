import { applyTheme } from "../components/feature/theme/theme.util";

// Theme initialization script to prevent FOUC (Flash of Unstyled Content)
// This script should run as early as possible in the document head
(function () {
  "use strict";

  applyTheme();

  const html = document.documentElement;
  html.classList.add("theme-initialized");
})();
