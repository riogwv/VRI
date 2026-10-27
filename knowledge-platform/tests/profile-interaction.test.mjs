import { test, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({ signIn: vi.fn(), signUp: vi.fn(), toast: vi.fn(), route: vi.fn() }));
vi.mock("../src/scripts/services/auth.js", () => ({ isAuthenticated: () => false, getUser: () => null, signInWithPassword: mocks.signIn, signUp: mocks.signUp, signOut: vi.fn() }));
vi.mock("../src/scripts/router.js", () => ({ dispatchRoute: mocks.route }));
vi.mock("../src/scripts/ui/toast.js", () => ({ showToast: mocks.toast }));
vi.mock("../src/scripts/utils/dom.js", () => ({ createEl: (tag, props = {}, children = []) => ({
  tag, props, children: Array.isArray(children) ? children.filter(Boolean) : [children],
  handlers: {}, value: "", textContent: "", disabled: false, valid: true,
  addEventListener(name, fn) { this.handlers[name] = fn; },
  reportValidity() { return this.valid; },
}) }));
import { renderProfile } from "../src/scripts/features/profile/profile.js";

function find(node, predicate) {
  if (!node || typeof node !== "object") return null;
  if (predicate(node)) return node;
  for (const child of node.children || []) { const match = find(child, predicate); if (match) return match; }
  return null;
}
async function formParts() {
  const page = await renderProfile();
  const form = find(page, (el) => el.tag === "form");
  return { form, email: form.children[0].children[0], password: form.children[0].children[1], login: form.children[1], signup: form.children[3], status: form.children[4] };
}
beforeEach(() => vi.clearAllMocks());

test("valid sign-in submits once while pending and restores buttons", async () => {
  const { form, email, password, login, signup } = await formParts();
  email.value = " person@example.com "; password.value = "secret";
  let resolve; mocks.signIn.mockImplementation(() => new Promise((done) => { resolve = done; }));
  const event = { preventDefault: vi.fn(), submitter: login };
  const pending = form.handlers.submit(event);
  await form.handlers.submit(event);
  expect(mocks.signIn).toHaveBeenCalledTimes(1);
  expect(mocks.signIn).toHaveBeenCalledWith("person@example.com", "secret");
  expect(login.disabled && signup.disabled).toBe(true);
  resolve(); await pending;
  expect(login.disabled || signup.disabled).toBe(false);
  expect(mocks.route).toHaveBeenCalledTimes(1);
});

test("invalid form does not call auth and signup errors remain visible", async () => {
  const { form, signup, status } = await formParts();
  const event = { preventDefault: vi.fn(), submitter: signup };
  form.valid = false; await form.handlers.submit(event);
  expect(mocks.signUp).not.toHaveBeenCalled();
  form.valid = true; mocks.signUp.mockRejectedValueOnce(new Error("Signup failed"));
  await form.handlers.submit(event);
  expect(status.textContent).toBe("Signup failed");
  expect(signup.disabled).toBe(false);
});

test("signup without a session asks for email confirmation", async () => {
  const { form, signup, status } = await formParts();
  mocks.signUp.mockResolvedValueOnce({ session: null });
  await form.handlers.submit({ preventDefault() {}, submitter: signup });
  expect(status.textContent).toContain("konfirmasi");
  expect(mocks.route).not.toHaveBeenCalled();
});
