import { expect, test } from "vitest";
import { resolveBasePath } from "../vite.config.js";

test("uses the root path by default and normalizes an explicit deployment base", () => {
  expect(resolveBasePath()).toBe("/");
  expect(resolveBasePath("/VRI/")).toBe("/VRI/");
  expect(resolveBasePath("VRI")).toBe("/VRI/");
  expect(resolveBasePath("///")).toBe("/");
  expect(resolveBasePath("https://preview.example/VRI")).toBe("/");
  expect(resolveBasePath("/VRI//assets/")).toBe("/");
});
