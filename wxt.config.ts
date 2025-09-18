import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  autoIcons: {
    baseIconPath: "assets/thumbnail.png",
    enabled: true,
    developmentIndicator: "overlay",
  },
  manifest: ({ browser, mode }) => ({
    name: mode === "development" ? "백준코드 (dev)" : "백준코드",
    description: "방금 푼 문제를 디스코드로!",
    icons: {
      16: "/icons/16.png",
      32: "/icons/32.png",
      48: "/icons/48.png",
      128: "/icons/128.png",
    },
    permissions: ["storage"],
    host_permissions: ["https://solved.ac/api/v3/*"],
  }),
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
