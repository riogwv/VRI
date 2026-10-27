import { test, expect, vi } from "vitest";

vi.mock("../src/scripts/config.js", () => ({ CONFIG: { api: { lichessBase: "https://example.test" } } }));
vi.mock("../src/scripts/services/api.js", () => ({ fetchJson: vi.fn() }));

import { lichess } from "../src/scripts/api/lichess.js";
import { fetchJson } from "../src/scripts/services/api.js";

test("consecutive completed requests fetch the next puzzle", async () => {
  fetchJson.mockReset().mockResolvedValueOnce({ id: "first" }).mockResolvedValueOnce({ id: "second" });
  const first = await lichess.getPuzzle();
  const second = await lichess.getPuzzle();
  expect(fetchJson).toHaveBeenCalledTimes(2);
  expect(fetchJson).toHaveBeenNthCalledWith(1, expect.any(String), { cache: "no-store" });
  expect(fetchJson).toHaveBeenNthCalledWith(2, expect.any(String), { cache: "no-store" });
  expect([first.id, second.id]).toEqual(["lichess:first", "lichess:second"]);
});

test("overlapping requests share the in-flight request", async () => {
  let resolve;
  fetchJson.mockReset().mockImplementation(() => new Promise((done) => { resolve = done; }));
  const first = lichess.getPuzzle();
  const second = lichess.getPuzzle();
  expect(fetchJson).toHaveBeenCalledTimes(1);
  resolve({ id: "shared" });
  expect(await first).toEqual(await second);
});

test("a failed request returns null and a later request can retry", async () => {
  const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    fetchJson.mockReset().mockRejectedValueOnce(new Error("unavailable")).mockResolvedValueOnce({ id: "retry" });
    expect(await lichess.getPuzzle()).toBeNull();
    expect((await lichess.getPuzzle()).id).toBe("lichess:retry");
    expect(fetchJson).toHaveBeenCalledTimes(2);
  } finally {
    warning.mockRestore();
  }
});
