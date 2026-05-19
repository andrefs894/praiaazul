# MVP Features (Phase 1)

## 1. Daily recommendation (CORE)
User opens app → immediately sees best beach for their profile.

Example:
> "Hoje a melhor praia para ti é: Praia da Arrábida"
> ☀️ 28°C · 🌊 Água 20°C · 💨 Vento fraco · 🟢 Lotação baixa
> 📍 35 min de carro · 🅿️ Parque gratuito (~200 lugares)

### Scoring algorithm (`src/lib/scoring.ts`)
```
score = (weight_temp × score_temperature)
      + (weight_wind × score_wind)
      + (weight_crowd × score_crowd)
      + (weight_distance × score_distance)
      + (weight_profile × score_profile_match)
```
Weights adjust based on user profile.

## 2. Quick profile (onboarding in 3 taps)
- What are you looking for? (Família / Sossego / Surf / Social)
- Where are you? (Geolocation or municipality)
- How far willing to drive? (25/50/100/200 km / Doesn't matter)

Stored in localStorage as `mare_alta_perfil`. Synced to Supabase if the user signs in (see feature 8).

## 3. Beach list with filters
By type (Costeira/Fluvial/Albufeira), services (Lifeguard/Bar/Acessível/Restaurante), Bandeira Azul, distance.

## 4. Beach detail page (FichaPraia)
- Title, type badge, favorite toggle
- **Photo gallery** — horizontal scroll, up to 10 photos from Google Places (with attribution)
- Weather + water quality merged card
- Lotação prevista (occupation indicator)
- Services & equipment grid
- **Nearby restaurants/bars/cafes** — up to 5 per type (max 15) within 500m, with photo carousel, rating, walking distance; filter pills (Todos / Restaurante / Bar / Café)
- Mini-map (Leaflet)
- "Como chegar" → Google Maps directions

## 5. Favorites
Save favorite beaches. Stored in localStorage as `mare_alta_favoritas` (number[]).
On Google sign-in (feature 8), migrated to `user_favoritas` (union with any existing remote rows). Logout keeps localStorage intact.

## 6. Parking info (static)
Has parking? Free/Paid? Type, capacity, distance to sand. Manual data for top ~50 beaches.

## 7. County-aware search (Explorar)
Search bar accepts beach name OR concelho. When the query matches one or more concelhos, results are grouped by concelho with a header (`📍 Concelho de Cascais (12 praias)`) and the matching beaches listed under it. Beaches matched by name appear in a separate "Praias" group below. Selecting a beach navigates to `/praia/:id`.

## 8. Optional Google login
Supabase Auth + Google OAuth. The app works fully without login — login only adds cross-device sync of favorites and profile.

- Logged-out: profile + favorites in localStorage.
- On login: localStorage data migrated to `user_profiles` and `user_favoritas` (union, no overwrite). Header avatar shows Google profile picture.
- On logout: localStorage data preserved.

## Folder structure
```
marealta/
├── CLAUDE.md
├── .claude/                     # On-demand context files
├── design/                      # Stitch AI design exports (gitignored except README)
├── src/
│   ├── main.tsx / App.tsx
│   ├── pages/
│   │   ├── PaginaHoje.tsx        # Recommendation home
│   │   ├── PaginaExplorar.tsx    # Search + county grouping
│   │   ├── PaginaFavoritas.tsx
│   │   └── PaginaPerfil.tsx      # Profile + login/account
│   ├── components/
│   │   ├── RecomendacaoDia.tsx   # Main recommendation card
│   │   ├── ListaPraias.tsx       # List with filters
│   │   ├── FichaPraia.tsx        # Beach detail page
│   │   ├── GaleriaFotos.tsx      # Photo gallery (NEW)
│   │   ├── PontosInteresse.tsx   # Nearby places (NEW)
│   │   ├── IndicadorOcupacao.tsx # Busyness indicator
│   │   ├── Mapa.tsx              # Leaflet map
│   │   ├── Header.tsx
│   │   └── NavBar.tsx
│   ├── hooks/
│   │   ├── usePraias.ts          # Fetch/cache beaches
│   │   ├── usePraiaComMeteo.ts   # Beaches joined with weather
│   │   ├── useMeteo.ts
│   │   ├── useRecomendacao.ts    # Top 5 ranking
│   │   ├── useLocalizacao.ts     # Geolocation
│   │   ├── usePerfil.ts          # localStorage / Supabase dual-source
│   │   ├── useFavoritas.ts       # localStorage / Supabase dual-source
│   │   ├── useFotos.ts           # (NEW) photos for a beach
│   │   ├── usePontosInteresse.ts # (NEW) nearby places
│   │   └── useAuth.ts            # (NEW) Supabase auth wrapper
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client (auth + REST)
│   │   ├── scoring.ts            # Scoring algorithm
│   │   ├── ocupacao.ts           # Heuristic busyness estimator
│   │   └── utils.ts              # General utilities
│   └── types/index.ts
└── n8n/workflows/                # JSON exports (committed, source of truth)
```
