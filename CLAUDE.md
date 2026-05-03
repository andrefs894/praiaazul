# CLAUDE.md — Praia Azul

## Project
Portuguese PWA — "What's the best beach for me, today?" in 3 seconds.
React + Vite + TypeScript, Tailwind CSS, Supabase (Postgres + Auth + REST), Leaflet or Mapbox (TBD).
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

## On-demand context
Before working on a specific area, read the relevant file from `.claude/`:
- `.claude/SCHEMA.md` — full database schema (praias, meteo_diario, qualidade_agua)
- `.claude/DATA_SOURCES.md` — API endpoints, update frequencies, credentials pattern
- `.claude/FEATURES.md` — MVP features, scoring algorithm, folder structure
- `.claude/ROADMAP.md` — timeline, Phase 2 ideas, risks

IMPORTANT: Only read the file relevant to the current task. Do NOT read all of them.

## Quick commands
```bash
npm run dev          # Start Vite dev server
npx supabase status  # Check Supabase connection
docker ps            # Check n8n is running
```
