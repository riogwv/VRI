# Panduan Deployment

## Prasyarat

- Node.js 18+
- Akun Supabase (gratis)
- Akun GNews (untuk berita, opsional)
- Akun Vercel / Cloudflare Pages / GitHub Pages (untuk hosting frontend)

## 1. Siapkan Supabase

1. Buat project di [supabase.com](https://supabase.com).
2. Buka SQL Editor, jalankan `database/schema.sql`.
3. Aktifkan RLS (sudah dalam schema).
4. Buat Edge Function:
   ```
   supabase functions deploy news-proxy
   ```
5. Set secret:
   ```
   supabase secrets set GNEWS_API_KEY=your_gnews_key
   ```

## 2. Konfigurasi Frontend

1. Salin `.env.example` ke `.env`:
   ```
   cp .env.example .env
   ```
2. Isi `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` dari dashboard Supabase.
3. Isi `VITE_EDGE_FUNCTION_URL` dengan URL Edge Function.

## 3. Build dan Deploy

### Vercel (preview atau hosting alternatif)

1. Import **satu** project Vercel dari repository ini, dengan Root Directory `knowledge-platform`.
2. Biarkan `VITE_BASE_PATH` kosong agar build berjalan dari `/`.
3. Set environment variables di Vercel project settings.
4. Gunakan preview deployment untuk branch/PR. GitHub Pages tetap produksi utama.

### Cloudflare Pages

1. Push kode ke GitHub.
2. Connect repository di [dash.cloudflare.com](https://dash.cloudflare.com/pages).
3. Build command: `npm run build`, build output: `dist`.
4. Set environment variables.

### GitHub Pages (produksi utama)

Workflow `.github/workflows/deploy-pages.yml` menjalankan test, lint, dan build dari `knowledge-platform/` lalu menerbitkan `dist/`. Workflow tersebut menetapkan `VITE_BASE_PATH=/VRI/` agar asset bekerja di `https://riogwv.github.io/VRI/`.

Untuk build Pages secara lokal:
```
VITE_BASE_PATH=/VRI/ npm run build
```

## 4. Variabel Lingkungan (Production)

| Variabel | Sumber | Wajib |
|---|---|---|
| VITE_SUPABASE_URL | Supabase dashboard > API | Ya |
| VITE_SUPABASE_ANON_KEY | Supabase dashboard > API | Ya |
| VITE_EDGE_FUNCTION_URL | Edge Function URL | Tidak (berita akan fallback) |
| VITE_JIKAN_API_BASE | https://api.jikan.moe/v4 | Tidak |
| VITE_WIKIDATA_API_BASE | https://www.wikidata.org/w/rest.php/wikibase/v1 | Tidak |
| VITE_LICHESS_API_BASE | https://lichess.org/api | Tidak |
| VITE_BASE_PATH | `/VRI/` hanya untuk GitHub Pages | Tidak |

## Peringatan

- **Jangan commit `.env`**. Gunakan `.env.example` sebagai templat.
- GNews paket gratis hanya untuk non-komersial.
- Project gratis Supabase pause setelah 1 minggu tidak aktif.
