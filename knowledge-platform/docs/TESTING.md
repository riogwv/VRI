# Checklist Pengujian MVP

Setiap item dicentang hanya setelah diuji secara aktual.

## Fungsi Inti

- [ ] Website dapat dijalankan (`npm run dev` dan `npm run build` berhasil)
- [ ] Tidak ada import yang rusak (build berhasil tanpa error)
- [ ] Navigasi utama berfungsi (semua link navigasi)
- [ ] Pencarian global berfungsi (hasil + kosong)
- <|content_limiter|> Konten dari API ditampilkan dengan sumber yang sesuai
- [ ] Kegagalan API ditangani dengan baik (pesan jelas + fallback)
- [ ] Dark mode / light mode berfungsi
- [ ] Responsif pada desktop dan ponsel

## Konten

- [ ] Artikel ensiklopedia bisa dibuka (detail + TOC + terkait)
- [ ] Kategori (Teknologi, Catur, Anime) menampilkan artikel
- [ ] Fun fact ditampilkan dengan penjelasan dan sumber
- [ ] Trivia menampilkan soal, opsi, jawaban, penjelasan
- [ ] Berita ditampilkan dengan sumber dan tanggal

## Permainan

- [ ] Sudoku: papan 9×9, input 1–9, validasi bertentangan, timer, kesalahan
- [ ] Sudoku: undo, reset, petunjuk, deteksi kemenangan
- [ ] Sudoku: puzzle memiliki solusi unik (divalidasi generator)
- [ ] Crossword: grid, petunjuk, input huruf, navigasi keyboard
- [ ] Crossword: validasi jawaban, indikator progres
- [ ] Chess: puzzle ditampilkan, tidak ada langkah ilegal, penjelasan taktik

## Sosial

- [ ] Autentikasi (masuk/daftar/keluar) bekerja
- [ ] Profil pengguna dapat dilihat
- [ ] Bookmark disimpan (lokalStorage / Supabase)
- [ ] Reaksi dan komentar (jika Supabase dikonfigurasi)
- [ ] Pengguna tidak dapat mengakses data privat pengguna lain (RLS)

## Keamanan

- [ ] Tidak ada secret API key terekspos di frontend
- [ ] `.env` tidak di-commit ke repository
- [ ] RLS aktif pada semua tabel user-owned

## Aksesibilitas

- [ ] HTML semantik
- [ ] Label input yang jelas
- [ ] Navigasi keyboard
- [ ] Fokus yang terlihat
- [ ] Kontras warna yang cukup

## Hasil Aktual

Tanggal pengujian: ____________
Penguji: ____________
Build berhasil: [ ] Ya [ ] Tidak
Semua item di atas: [ ] Selesai [ ] Belum (daftar yang belum: ____________)

Catatan: ________________________________________________________