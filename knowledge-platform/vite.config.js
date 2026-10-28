import { defineConfig } from "vite";

export function resolveBasePath(value) {
  const path = value?.trim();
  if (!path || path === "/") return "/";
  return `/${path.replace(/^\/+|\/+$/g, "")}/`;
}

export default defineConfig({
  root: ".",
  base: resolveBasePath(process.env.VITE_BASE_PATH),
  publicDir: "public",
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    port: 5173,
    open: true,
  },
});
