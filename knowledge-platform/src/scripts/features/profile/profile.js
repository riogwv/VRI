/* ==========================================================================
   Profile page — user profile + sign in/out
   ========================================================================== */

import { createEl } from "../../utils/dom.js";
import { isAuthenticated, getUser, signInWithPassword, signUp, signOut } from "../../services/auth.js";
import { dispatchRoute } from "../../router.js";
import { showToast } from "../../ui/toast.js";

export async function renderProfile() {
  const authed = isAuthenticated();
  const user = getUser();

  const page = createEl("section", { className: "page profile-page" }, [
    createEl("div", { className: "container" }, [
      createEl("h2", { style: "margin-bottom:var(--space-6)" }, authed ? "Profil Saya" : "Masuk / Daftar"),
      authed ? profileSignedIn(user) : profileSignInForm(),
    ]),
  ]);

  return page;
}

function profileSignedIn(user) {
  return createEl("div", { className: "card" }, [
    createEl("div", { className: "card-body" }, [
      createEl("div", { style: "display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-5)" }, [
        createEl("div", {
          style: "width:56px;height:56px;border-radius:50%;background:var(--color-border);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:var(--text-xl)",
        }, (user.email || "U").charAt(0).toUpperCase()),
        createEl("div", {}, [
          createEl("h3", { style: "margin:0" }, user.email || "Pengguna"),
          createEl("p", { style: "color:var(--color-text-muted);font-size:var(--text-sm)" }, "Terdaftar sejak " + new Date(user.created_at).toLocaleDateString("id-ID")),
        ]),
      ]),
      createEl("div", { style: "display:flex;gap:var(--space-2);flex-wrap:wrap" }, [
        createEl("button", { className: "btn btn-outline", onClick: async () => { try { await signOut(); showToast("Berhasil keluar", "success"); window.location.hash = "#/"; } catch (err) { showToast(err.message || "Gagal keluar", "error"); } } }, "Keluar"),
      ]),
    ]),
  ]);
}

function profileSignInForm() {
  const emailInput = createEl("input", {
    type: "email",
    "aria-label": "Email",
    autocomplete: "email",
    placeholder: "Email",
    style: "width:100%;padding:var(--space-3)var(--space-4);border:1px solid var(--color-border);border-radius:var(--radius);background:var(--color-surface);color:var(--color-text);margin-bottom:var(--space-3);font-size:var(--text-sm)",
  });
  const passInput = createEl("input", {
    type: "password",
    "aria-label": "Kata sandi",
    autocomplete: "current-password",
    placeholder: "Kata sandi",
    style: "width:100%;padding:var(--space-3)var(--space-4);border:1px solid var(--color-border);border-radius:var(--radius);background:var(--color-surface);color:var(--color-text);margin-bottom:var(--space-4);font-size:var(--text-sm)",
  });

  const form = createEl("form", {}, [
    createEl("div", {}, [emailInput, passInput]),
    createEl("button", {
      className: "btn btn-primary",
      style: "width:100%",
      onClick: async (e) => {
        e.preventDefault();
        try {
          await signInWithPassword(emailInput.value, passInput.value);
          showToast("Berhasil masuk", "success");
          dispatchRoute();
        } catch (err) {
          showToast(err.message || "Gagal masuk", "error");
        }
      },
    }, "Masuk"),
    createEl("p", { style: "margin-top:var(--space-3);font-size:var(--text-sm);color:var(--color-text-muted);text-align:center" },
      "Belum punya akun? "),
    createEl("button", {
      className: "btn btn-link",
      style: "width:100%;padding:0;text-align:left",
      onClick: async (e) => {
        e.preventDefault();
        try {
          const result = await signUp(emailInput.value, passInput.value);
          if (result.session) {
            showToast("Akun dibuat dan berhasil masuk.", "success");
            dispatchRoute();
          } else {
            showToast("Periksa email untuk konfirmasi akun, lalu masuk.", "info");
          }
        } catch (err) {
          showToast(err.message || "Gagal mendaftar", "error");
        }
      },
    }, "Daftar buat akun baru"),
  ]);

  return createEl("div", { className: "card" }, [
    createEl("div", { className: "card-body" }, [
      createEl("p", { style: "color:var(--color-text-secondary);margin-bottom:var(--space-4)" },
        "Anda dapat membaca artikel dan bermain tanpa masuk. Artikel yang disimpan saat ini hanya tersedia di browser ini."),
      form,
    ]),
  ]);
}
