import * as path from "node:path";

import { defineConfig } from "@rspress/core";
import mermaid from "rspress-plugin-mermaid";

// GitHub Pages 项目站：https://canyon-project.github.io/canyon/
// CI 里设 GITHUB_PAGES=true；本地默认 /
const base = process.env.GITHUB_PAGES === "true" ? "/canyon/" : "/";

export default defineConfig({
  plugins: [mermaid()],
  root: path.join(__dirname, "docs"),
  base,
  lang: "zh",
  title: "Canyon",
  description: "覆盖率采集、快照与 PR/MR CI 集成",
  icon: "/rspress-icon.png",
  logo: {
    light: "/rspress-light-logo.png",
    dark: "/rspress-dark-logo.png",
  },
  themeConfig: {
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/canyon-project/canyon",
      },
    ],
  },
});
