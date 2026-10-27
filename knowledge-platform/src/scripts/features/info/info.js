import { createEl } from "../../utils/dom.js";

const PAGES = {
  about: {
    title: "Tentang Knowledge Hub",
    paragraphs: [
      "Knowledge Hub adalah proyek pengetahuan interaktif dengan artikel dan permainan bertema teknologi, catur, anime, dan sains.",
      "Sebagian fitur masih dalam pengembangan. Konten yang tersedia dapat dijelajahi melalui halaman Eksplorasi.",
    ],
  },
  sources: {
    title: "Sumber Data",
    paragraphs: [
      "Artikel, fakta, trivia, dan sebagian puzzle berasal dari data internal yang disertakan dalam proyek.",
      "Proyek memiliki integrasi untuk Jikan, Wikidata, Lichess, dan GNews; ketersediaannya bergantung pada fitur, layanan, dan konfigurasi.",
      "Periksa sumber dan atribusi pada konten terkait sebelum menggunakan kembali materi dari pihak lain.",
    ],
  },
  privacy: {
    title: "Informasi Privasi",
    paragraphs: [
      "Kebijakan privasi resmi belum dipublikasikan oleh pengelola. Informasi berikut hanya menjelaskan perilaku yang terlihat pada versi aplikasi ini.",
      "Pilihan tema dan artikel yang disimpan dapat disimpan di browser perangkat ini. Jika login dikonfigurasi, Supabase menangani autentikasi dan sesi.",
      "Aplikasi memuat font dari Google dan dapat menghubungi layanan eksternal tergantung fitur dan konfigurasi. Kebijakan layanan tersebut dapat berlaku.",
    ],
  },
  terms: {
    title: "Syarat Layanan",
    paragraphs: ["Syarat layanan resmi belum dipublikasikan oleh pengelola. Halaman ini belum merupakan perjanjian layanan."],
  },
  moderation: {
    title: "Laporan dan Moderasi",
    paragraphs: ["Fitur dan saluran laporan belum tersedia pada aplikasi ini. Jangan mengirimkan informasi pribadi melalui fitur yang belum disediakan."],
  },
};

export async function renderInfoPage(key) {
  const page = PAGES[key];
  return createEl("section", { className: "page" }, [
    createEl("div", { className: "container" }, [
      createEl("h1", { style: "margin-bottom:var(--space-4)" }, page.title),
      ...page.paragraphs.map((text) => createEl("p", { style: "margin-bottom:var(--space-4)" }, text)),
      createEl("a", { className: "btn-link", href: "#/" }, "Kembali ke Beranda"),
    ]),
  ]);
}
