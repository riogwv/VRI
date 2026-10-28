import { defineConfig } from "vite";

export function resolveBasePath(value) {
  const path = value?.trim().replace(/^\/+|\/+$/g, "");
  if (!path || !/^[A-Za-z0-9._~-]+(?:\/[A-Za-z0-9._~-]+)*$/.test(path)) return "/";
  return `/${path}/`;
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
