# Knowledge Platform — Tech, Chess & Anime

An interactive knowledge social platform combining an encyclopedia, social feed, tech news portal, fun facts, trivia, brain games (Sudoku, Crossword, Chess), and discovery. Built with vanilla JavaScript + Supabase (auth/database/RLS) + verified external APIs with honest fallbacks.

## MVP Scope (working)

- Homepage discovery feed (For You / Latest / Popular × Technology, Chess, Anime)
- Encyclopedia articles with categories, related links, TOC, sources, bookmarks, share
- News (GNews via Supabase Edge Function proxy + local seed fallback)
- Fun facts & trivia with validation, scoring, and bookmarks
- Sudoku (levels, validation, candidates, timer, mistakes, hints, undo/redo, win detection)
- Crossword (validated grid + clues, keyboard nav, validation, progress)
- Chess puzzles (Lichess + local seed; legal move display only)
- Global search over articles, facts, trivia, news
- Social: Supabase Auth, profiles, bookmarks, reactions, comments (Row Level Security)

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Vanilla HTML/CSS/JS modules + Vite (dev server + static build) |
| Database/Auth/Storage | Supabase (PostgreSQL + Auth + RLS + Edge Functions + Realtime) |
| Anime/Manga | Jikan API (public, no key) |
| Tech news | GNews via Supabase Edge Function (key never in frontend) |
| Facts/encyclopedia | Wikidata REST API (read-only, CC0 structured data) |
| Chess | Lichess API + chess.js (MIT) |
| Sudoku | sudoku.js (MIT) |
| Crossword | Local curated validated puzzle set |
| Hosting | GitHub Pages (produksi) + satu Vercel project opsional untuk preview |

## Prerequisites

- Node.js 18+
- A free Supabase account/project
- A GNews API key (free tier: 100 requests/day, non-commercial) — optional for direct use; the Edge Function proxy reads it server-side

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase URL and anon key from the Supabase project dashboard > Settings > API.

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run the database migration in `database/schema.sql` via the Supabase SQL Editor.
3. Deploy the Edge Function in `backend/api/news/` (GNews proxy).
4. Enable Row Level Security (RLS) on all user-owned tables.

### 4. Run the dev server

```bash
npm run dev
```

Open `http://localhost:5173`.

### 5. Build for production

```bash
npm run build
```

Output goes to `dist/`. GitHub Pages sets `VITE_BASE_PATH=/VRI/` in its workflow; local and Vercel builds use `/`.

## Project structure

```
knowledge-platform/
├── index.html              # App entry point
├── package.json            # Scripts & dev dependencies
├── .env.example            # Environment template (no secrets)
├── .gitignore
├── public/                 # Static assets (favicon, icons, images)
│   ├── assets/icons/
│   └── assets/images/
├── src/
│   ├── styles/             # Design system (tokens, reset, global, layout, components, responsive)
│   └── scripts/
│       ├── main.js         # App bootstrap
│       ├── router.js       # Hash router
│       ├── config.js       # Env + app config
│       ├── api/            # External API clients (jikan, gnews, wikidata, lichess)
│       ├── services/       # Cache, storage, supabase client
│       ├── components/     # UI components (cards, buttons, modals, etc.)
│       ├── features/       # Feature modules (feed, articles, news, trivia, sudoku, crossword, chess)
│       ├── state/          # App state (auth, feed state, ui state)
│       └── utils/          # Helpers (date, sanitize, format)
│       └── data/           # Seed + fallback content
├── backend/                # Supabase Edge Functions
│   └── api/news/           # GNews proxy function
├── database/               # SQL schema + seed
├── tests/                  # Unit + acceptance tests
└── docs/
    ├── ARCHITECTURE.md
    ├── API_INTEGRATION.md
    ├── DEPLOYMENT.md
    └── TESTING.md
```

## API keys & secrets

Never place secret API keys in the frontend. GNews requires a key and must be called only from the Supabase Edge Function (`backend/api/news/`). Public APIs (Jikan, Wikidata, Lichess) do not need a key but must still respect rate limits and attribution.

See `docs/API_INTEGRATION.md` for verified limits, attribution, and fallback behavior.

## License

MIT — see `LICENSE`. External data sources retain their own licenses (see `docs/API_INTEGRATION.md`).