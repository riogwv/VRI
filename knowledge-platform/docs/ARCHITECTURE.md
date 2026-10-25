# Arsitektur — Knowledge Platform

## Ringkasan

Platform pengetahuan interaktif (Teknologi, Catur, Anime) dengan arsitektur:

```
Browser (vanilla JS + Vite)
   │
   ├─► External APIs (read-only, public): Jikan, Wikidata, Lichess
   ├─► Supabase Edge Function → GNews (API key server-side)
   └─► Supabase (PostgreSQL + Auth + RLS + Edge Functions + Realtime)
```

## Teknologi

| Layer | Pilihan | Alasan |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS + Vite | Zero framework overhead, cepat, mudah dipelihara |
| Styling | CSS variables (design tokens) | Konsisten, dark mode, responsif |
| Routing | Hash router custom (~60 baris) | Tidak perlu build step untuk routing klien |
| Database/Auth | Supabase (PostgreSQL) | Gratis, RLS, Auth bawaan, Edge Functions |
| Hosting | Vercel / Cloudflare Pages | Static hosting gratis |

## Alur Data

1. Konten internal (seed): `src/data/seed/*.json` → dimuat oleh `content.js`
2. Konten eksternal: API klien di `src/scripts/api/` → cache TTL → fallback lokal
3. Berita: frontend → Supabase Edge Function → GNews (kunci API di server)
4. Sosial (bookmark, reaksi, komentar): frontend → Supabase (RLS melindungi data)

## Keamanan

- Tidak ada secret API key di frontend (GNews key hanya di Edge Function env)
- Semua konten eksternal dianggap tidak tepercaya → sanitasi, sumber, label
- RLS pada setiap tabel user-owned di Supabase
- Password tidak pernah disimpan plain text (Supabase Auth)

## Pembatasan

- GNews gratis: 100 req/hari, 12 jam keterlambatan, non-komersial
- Jikan: instance publik bersama, rate-limited → cache + seed fallback
- Lichess: satu request sekaligus, tunggu 1 menit pada 429

## Struktur Direktori

```
knowledge-platform/
├── index.html
├── vite.config.js
├── package.json
├── .env.example
├── public/               # Aset statis
├── src/
│   ├── styles/           # Design system (tokens, reset, global, responsive)
│   ├── scripts/
│   │   ├── main.js       # Bootstrap
│   │   ├── router.js     # Hash router
│   │   ├── config.js     # Konfigurasi + env
│   │   ├── api/          # Klien API eksternal
│   │   ├── services/     # Supabase, auth, cache, content
│   │   ├── components/   # Komponen UI reusable
│   │   ├── features/     # Modul fitur (home, article, sudoku, dll)
│   │   ├── ui/           # Tema, nav, search, toast
│   │   └── utils/        # Helper DOM
│   └── data/             # Seed + fallback JSON
├── backend/api/news/     # Edge Function (GNews proxy)
├── database/schema.sql   # Skema + RLS
├── tests/
└── docs/
```
