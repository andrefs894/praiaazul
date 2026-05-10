# Roadmap & Future Plans

## Phase 1 — MVP (target: summer 2026)

### Done (as of May 2026)
- React + Vite + TS + Tailwind project scaffold
- Supabase: praias, meteo_diario, qualidade_agua tables populated
- n8n workflows: import beaches, daily weather, sea+temp, UV, water quality, match-google-places, popular-times (dormant)
- Scoring algorithm + recommendation engine (top 5)
- Pages: Hoje, Explorar (with search → navigate to detail), Favoritas, Perfil
- Components: RecomendacaoDia, ListaPraias (with filters), FichaPraia, Mapa, Header, NavBar
- Profile (localStorage) feeds scoring
- Favorites (localStorage)
- Lotação prevista (heuristic indicator on Hoje + FichaPraia)
- **Google OAuth login** — optional sync of favorites + profile via Supabase Auth
- **County-aware Explorar search** — results grouped by concelho with header when query matches one
- **Beach photo gallery** — `praia_fotos` table + `photos-google-places.json` workflow + `GaleriaFotos` component (carousel with arrows + dots)
- **Nearby restaurants/bars/cafes** — `pontos_interesse` table + `nearby-places.json` workflow + `PontosInteresse` component (up to 5 per type, filter pills, photo carousel, surf school exclusion)

### Remaining before launch
1. **Stitch AI design import** — apply across pages: Hoje → FichaPraia → Explorar → Favoritas → Perfil
2. **Parking data** — manual entry for top ~50 beaches
3. **Testing + polish** — test with 5–10 friends, mobile fixes
4. **Vercel deploy** — soft launch, share on social media/forums

## Phase 2 (do NOT implement now)
- Parking crowdsourcing ("Did you find a spot?")
- User-shared daily photos
- Proactive notifications ("Your favorite beach is 24°C!")
- Social component (see where friends are)
- Local business integration (bookings, food, equipment rental)
- Expansion to hiking trails, viewpoints, hot springs
- Real-time SerpAPI popular_times (currently dormant pending plan upgrade)

## Business context
- Target: Portugal B2C, ~600 classified beaches, ~10M residents + ~20M tourists/year
- Competitors: Info Praia (APA), MEO Beachcam, Praia em Directo — all data dashboards, none solve the decision
- MVP goal: validate summer 2026, target 1,000 users
- Future monetization (2027+): beach concession partnerships, booking commissions, municipal data reports

## Known risks
| Risk | Mitigation |
|------|-----------|
| APA/IPMA APIs unstable | Aggressive caching, static fallback |
| Parking data missing for most beaches | Start with top 50 beaches, static data |
| Google Places monthly cost grows with users | Photos/nearby refresh monthly, not per-request |
| Seasonality (app dies in winter) | Expand to trails, viewpoints, hot springs |
| Not enough time before summer | Prioritize: recommendation + detail + login + photos = enough to launch |
