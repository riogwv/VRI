# Integrasi API & Sumber Data

Semua integrasi telah diverifikasi terhadap dokumentasi resmi. Kunci API rahasia **tidak pernah diletakkan di frontend**.

## 1. Jikan API (Anime/Manga)

- Endpoint: `https://api.jikan.moe/v4`
- Autentikasi: tidak diperlukan (instance publik)
- Lisensi: data dari MyAnimeList; atribusi diperlukan
- Batas: instance publik bersama, rate-limited; gunakan cache + seed fallback
- Digunakan untuk: pencarian anime, detail anime, anime populer
- Frontend access: diizinkan (publik tanpa kunci)
- Catatan: jangan terlalu banyak panggilan; cache 24 jam

## 2. Wikidata REST API (Ensiklopedia/Fakta)

- Endpoint: `https://www.wikidata.org/w/rest.php/wikibase/v1`
- Autentikasi: tidak diperlukan (baca saja)
- Lisensi: CC0 untuk data terstruktur
- Batas: sesuai aturan rate limiting Wikimedia
- Digunakan untuk: pencarian entitas, fakta pengetahuan
- Frontend access: diizinkan
- Catatan: data berlisensi CC0, cocok untuk disimpan/di-cache

## 3. GNews (Berita Teknologi)

- Endpoint: `https://gnews.io/api/v4` (melalui Edge Function proxy)
- Autentikasi: API key (disimpan di Supabase Edge Function env)
- Paket gratis: 100 req/hari, 10 artikel/req, keterlambatan 12 jam, 30 hari histori
- Lisensi: non-komersial untuk paket gratis
- Frontend access: **tidak diizinkan** — kunci tidak boleh terekspos
- Digunakan untuk: berita teknologi
- Fallback: data lokal labeled "cadangan" saat API gagal
- Edge Function: `backend/api/news/index.js`

## 4. Lichess API (Puzzle Catur)

- Endpoint: `https://lichess.org/api/puzzles/next`
- Autentikasi: tidak diperlukan (anonim OK)
- Lisensi: data publik Lichess
- Batas: satu request sekaligus; tunggu 1 menit jika 429; CORS `*`
- Digunakan untuk: puzzle catur harian
- Frontend access: diizinkan (anonim)
- Catatan: jangan gunakan untuk unduhan massal puzzle

## 5. Sudoku (lokal)

- Pustaka: implementasi sendiri (generator + solver + validator)
- Lisensi: internal (MIT untuk proyek ini)
- Digunakan untuk: permainan Sudoku
- Validasi: puzzle divalidasi untuk solusi unik

## 6. Crossword (lokal)

- Data: `src/data/seed/crossword.json` (dikurasi, tervalidasi)
- Lisensi: internal
- Digunakan untuk: permainan Teka-Teki Silang
- Catatan: generator ditunda ke versi berikutnya

## Fallback

Setiap panggilan API memiliki blok try/catch. Saat gagal:
- Tampilkan pesan error yang jelas
- Kembalikan array kosong atau data lokal cadangan
- Label konten cadangan sebagai "Lokal (cadangan)" agar tidak menipu pengguna
