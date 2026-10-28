/* Profile — auth, account identity, and clearly separated local activity. */
import { createEl } from "../../utils/dom.js";
import { isAuthenticated, getUser, signInWithPassword, signUp, signOut } from "../../services/auth.js";
import { dispatchRoute } from "../../router.js";
import { showToast } from "../../ui/toast.js";
import { clearPlayerProgress, getPlayerProgress } from "../../services/player-progress.js";
import { clearGameProgress, getGameProgress } from "../../services/game-progress.js";
import { getBookmarks } from "../../services/bookmarks.js";
import { getProfile, saveProfile, syncAccount } from "../../services/cloud-sync.js";

const fieldStyle = "width:100%;padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius);background:var(--color-surface);color:var(--color-text);margin-bottom:var(--space-3);font-size:var(--text-sm)";

export async function renderProfile() {
  const authed = isAuthenticated(), user = getUser();
  const cloud = authed ? await getProfile(user) : null;
  return createEl("section", { className: "page profile-page" }, [createEl("div", { className: "container" }, [
    createEl("h1", { style: "margin-bottom:var(--space-6)" }, authed ? "Profil Saya" : "Masuk / Daftar"),
    authed ? profileSignedIn(user, cloud) : profileSignInForm(), localActivityCard(authed),
  ])]);
}

function profileSignedIn(user, cloud) {
  const display = createEl("input", { placeholder: "Nama tampilan", value: cloud?.full_name || user.user_metadata?.full_name || "", style: fieldStyle, "aria-label": "Nama tampilan" });
  const username = createEl("input", { placeholder: "Username", value: cloud?.username || "", style: fieldStyle, "aria-label": "Username" });
  const bio = createEl("textarea", { placeholder: "Bio singkat", style: fieldStyle, "aria-label": "Bio singkat" }); bio.value = cloud?.bio || "";
  const avatar = createEl("input", { type: "url", placeholder: "URL avatar (opsional)", value: cloud?.avatar_url || "", style: fieldStyle, "aria-label": "URL avatar" });
  const status = createEl("p", { role: "status", "aria-live": "polite", className: "auth-status" });
  const save = createEl("button", { className: "btn btn-primary", type: "button" }, "Simpan profil");
  save.addEventListener("click", async () => {
    save.disabled = true; status.textContent = "Menyimpan profil…";
    try { await saveProfile(user, { full_name: display.value, username: username.value, bio: bio.value, avatar_url: avatar.value }); status.textContent = "Profil tersimpan."; }
    catch (error) { status.textContent = error.message || "Profil belum dapat disimpan."; }
    finally { save.disabled = false; }
  });
  const progress = getGameProgress();
  return createEl("div", { className: "card" }, [createEl("div", { className: "card-body" }, [
    createEl("h2", {}, display.value || user.email || "Pengguna"),
    createEl("p", { style: "color:var(--color-text-muted);font-size:var(--text-sm)" }, `Akun sejak ${new Date(user.created_at).toLocaleDateString("id-ID")}`),
    display, username, bio, avatar, save, status,
    createEl("p", { className: "local-activity-stats" }, `☁ ${getBookmarks().length} simpanan · 🎮 ${progress.completed}/${progress.played} selesai · 🔥 ${progress.player.streak.current} hari`),
    createEl("button", { className: "btn btn-outline", onClick: async () => { try { await signOut(); showToast("Berhasil keluar", "success"); window.location.hash = "#/"; } catch (error) { showToast(error.message || "Gagal keluar", "error"); } } }, "Keluar"),
  ])]);
}

function profileSignInForm() {
  const email = createEl("input", { type: "email", autocomplete: "email", placeholder: "Email", style: fieldStyle, "aria-label": "Email" });
  const password = createEl("input", { type: "password", autocomplete: "current-password", placeholder: "Kata sandi", style: fieldStyle, "aria-label": "Kata sandi" });
  email.required = password.required = true;
  const login = createEl("button", { className: "btn btn-primary", type: "submit", style: "width:100%" }, "Masuk");
  const signup = createEl("button", { className: "btn btn-link", type: "submit", style: "width:100%;padding:0;text-align:left" }, "Daftar buat akun baru");
  const status = createEl("p", { role: "status", "aria-live": "polite", className: "auth-status" });
  const form = createEl("form", {}, [createEl("div", {}, [email, password]), login, createEl("p", { style: "margin-top:var(--space-3)" }, "Belum punya akun?"), signup, status]);
  let pending = false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); if (pending || !form.reportValidity()) return;
    const registering = event.submitter === signup; pending = true; login.disabled = signup.disabled = true; status.textContent = registering ? "Membuat akun…" : "Sedang masuk…";
    try { const result = registering ? await signUp(email.value.trim(), password.value) : await signInWithPassword(email.value.trim(), password.value); if (registering && !result.session) { status.textContent = "Periksa email untuk konfirmasi akun, lalu masuk."; return; } await syncAccount(getUser()); dispatchRoute(); }
    catch (error) { status.textContent = error.message || "Login gagal"; }
    finally { pending = false; login.disabled = signup.disabled = false; }
  });
  return createEl("div", { className: "card" }, [createEl("div", { className: "card-body" }, [createEl("p", { style: "color:var(--color-text-secondary)" }, "Tetap gunakan VRI tanpa akun. Masuk untuk menyimpan artikel dan progres permainan ke akunmu."), form])]);
}

function localActivityCard(authed) {
  const progress = getPlayerProgress(), completed = Object.values(progress.games).reduce((total, game) => total + game.completed, 0);
  return createEl("section", { className: "card local-activity-card" }, [createEl("div", { className: "card-body" }, [
    createEl("h2", {}, authed ? "Aktivitas perangkat ini" : "Aktivitas lokal"),
    createEl("p", { style: "color:var(--color-text-secondary)" }, authed ? "Data lokal disatukan dengan akun saat sinkronisasi berhasil. Menghapusnya di sini tidak menghapus data akun." : "Data disimpan hanya di browser ini. Masuk untuk menyimpannya ke akun."),
    createEl("p", { className: "local-activity-stats" }, `🔥 ${progress.streak.current} hari · 🏆 terbaik ${progress.streak.longest} · 🎮 ${completed} permainan selesai`),
    createEl("button", { className: "btn btn-outline", type: "button", onClick: () => { clearPlayerProgress(); clearGameProgress(); showToast("Aktivitas perangkat telah dihapus.", "success"); dispatchRoute(); } }, "Hapus aktivitas perangkat"),
  ])]);
}
