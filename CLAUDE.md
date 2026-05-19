# CLAUDE.md — Maré Alta

## Project
Portuguese PWA — "What's the best beach for me, today?" in 3 seconds.
React + Vite + TypeScript, Tailwind CSS, Supabase (Postgres + Auth + REST), **Leaflet** for maps.
Data ingestion via n8n (Docker, local). Deployment on Vercel (later, not now).

## Dev environment
- Windows + VS Code
- Docker Desktop running n8n at `http://localhost:5678`
- Developer is learning — keep code simple, well-commented, explain the "why"

## Code rules
- UI text and domain variable/function names in **Portuguese** (e.g. `praias`, `meteo_diario`, `recomendacao`)
- Code comments in English or Portuguese — either is fine
- Mobile-first. Recommendation must load in <3 seconds
- Don't over-engineer — this is an MVP. Simple solutions win.
- Small, descriptive git commits

## Auth
Optional Google OAuth via Supabase Auth. The app works fully without login (profile + favorites in localStorage). When the user signs in, localStorage data is migrated to the `user_profiles` and `user_favoritas` tables (union with any existing remote rows). Logout keeps localStorage intact so the user can keep browsing offline.

## Design
The visual design is authored in **Stitch AI** and dropped into `design/` as exported HTML/CSS. To apply a design to a page:
1. Read the relevant HTML in `design/`.
2. Find the matching React page (e.g. `src/pages/PaginaHoje.tsx`).
3. Translate layout + styles, replacing static placeholders with existing data hooks.
4. Keep Tailwind utilities where Stitch produced them; otherwise inline styles in the dark-theme palette (`#0F1923` bg, `#132A3A` cards, `#1A6FB5` accent).

`design/` is git-ignored except for `design/README.md`.

## On-demand context
Before working on a specific area, read the relevant file from `.claude/`:
- `.claude/SCHEMA.md` — full database schema (praias, meteo_diario, qualidade_agua, ocupacao_horaria, praia_fotos, pontos_interesse, user_profiles, user_favoritas)
- `.claude/DATA_SOURCES.md` — API endpoints, update frequencies, credentials pattern (IPMA, APA, Google Places, SerpAPI, Google OAuth)
- `.claude/FEATURES.md` — MVP features, scoring algorithm, folder structure
- `.claude/ROADMAP.md` — timeline, Phase 2 ideas, risks

IMPORTANT: Only read the file relevant to the current task. Do NOT read all of them.

## Quick commands
```bash
npm run dev          # Start Vite dev server
npx supabase status  # Check Supabase connection
docker ps            # Check n8n is running
```
