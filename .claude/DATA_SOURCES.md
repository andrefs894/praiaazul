# Data Sources

## 1. Weather — IPMA (free)
- **Endpoint:** `https://api.ipma.pt/open-data/forecast/meteorology/cities/daily/{globalIdLocal}.json`
- **Data:** Temp min/max, precipitation, wind, weather state, UV
- **Update:** 2x/day (00h and 12h UTC) via `n8n/workflows/meteo-diario.json`
- **Auth:** None (free, open). Good practice to email `webmaster@ipma.pt`

## 2. Beach list — APA / SNIAmb ArcGIS REST (free)
- **Endpoint:** `https://sniambgeoogc.apambiente.pt/getogc/rest/services/SNIAmb/Praias/MapServer/0/query`
- **Params:** `where=1=1&outFields=*&returnGeometry=true&f=json&resultRecordCount=2000`
- **Data:** ~760 beaches (name, municipality, coordinates, type, services)
- **Format:** ArcGIS JSON. `categoria_agua_balnear`: 1=costeira, 2=fluvial, 3=albufeira
- **Usage:** One-time import via `n8n/workflows/importar-praias.json`

## 3. Water quality — InfoÁgua (APA) (free)
- **URL:** `https://infoagua.apambiente.pt/`
- **Workflow:** `n8n/workflows/qualidade-agua.json` (weekly)

## 4. Sea swell + water temp — IPMA (free)
- **URL:** `https://api.ipma.pt/` (sea state section)
- **Workflow:** `n8n/workflows/mar-e-temperatura.json` (daily)

## 5. UV index — IPMA (free)
- **Workflow:** `n8n/workflows/uv-index.json`

## 6. Google Places API (paid — billed via Google Cloud)
Used for three purposes. Beaches have `google_place_id` populated once, then ratings, photos, and nearby places refresh on schedule.

- **Auth:** API key with `X-Goog-Api-Key` header. Restrict to Places API + your IP/domain. Stored in n8n credentials.
- **Required attribution:** Photos must show the `authorAttributions` string. Place details must link back to the Google Maps URL when displayed.

| Endpoint | Used by | Cadence | Cost (approx) |
|---|---|---|---|
| `places:searchText` | `match-google-places.json` — find place_id by name+concelho, validate by ≤5km Haversine + significant-token overlap with `displayName` | once per new beach | ~$0.032 / call |
| `places/{id}` (field mask `photos`) + `places/.../photos/.../media` | `photos-google-places.json` (NEW) — fetch up to 10 photos per beach | monthly | ~$0.007 + ~$0.007/photo |
| `places:searchNearby` (radius=500m, types restaurant/bar/cafe) + photo media | `nearby-places.json` (NEW) — top 5 places per beach | monthly | ~$0.032 + $0.007/photo |

One-time setup cost: photos for ~600 beaches ≈ $4–5. Monthly nearby refresh ≈ $35.

**Known limitation:** ~20 beach groups legitimately share a `google_place_id` because Google has a single listing for a long stretch of coast that we split into sub-sections (e.g. "Foo (Norte)/(Centro)/(Sul)"). These share photos and nearby places — that's correct, since they're physically the same beach. A small number of beaches stay `NULL` because they have no Google Places listing at all.

## 7. SerpAPI — Google Maps popular_times (paid, free tier has 100 calls/month)
- **URL:** `https://serpapi.com/search` (engine `google_maps`, query `place_id:...`)
- **Workflow:** `n8n/workflows/popular-times.json` (monthly cron, 1st of month 06:00)
- **Writes:** `ocupacao_horaria` table (~168 rows per beach)
- **Status:** Workflow exists but is dormant pending SerpAPI plan upgrade. The frontend uses a heuristic (`src/lib/ocupacao.ts`) when no row is present.

## 8. Tides — Instituto Hidrográfico (deferred)
- **URL:** `https://www.hidrografico.pt/`
- **Note:** No official API — may need scraping or static annual dataset. Not in MVP.

## 9. Google Maps Directions API (deferred)
- $200/month free credit. Not used in MVP — `FichaPraia` deep-links to the Google Maps web app instead (`?api=1&destination=lat,lng`).

## 10. Google OAuth (auth — Phase 1)
Used by Supabase Auth for the optional "Sign in with Google" flow.

Setup steps (one-time, manual):
1. **Google Cloud Console:** create OAuth 2.0 Client ID (type: Web application).
   - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
   - Authorized JS origins: production domain + `http://localhost:5173` for dev
2. **Supabase Dashboard:** Authentication → Providers → Google → enable, paste client ID + secret.
3. Frontend uses `supabase.auth.signInWithOAuth({ provider: 'google' })` — no extra config needed in code.

---

## n8n setup
Runs locally via Docker. Connects to Supabase cloud via Postgres:
- Host: `db.[PROJECT_ID].supabase.co` | DB: `postgres` | User: `postgres` | Port: `5432`

### Workflows
| File | Purpose | Cadence |
|---|---|---|
| `importar-praias.json` | One-time beach import from APA | once |
| `preencher-codigos-balneares.json` | Fills bathing water classification codes | once |
| `meteo-diario.json` | IPMA daily forecast | cron 00h/12h |
| `mar-e-temperatura.json` | Sea state & water temp | daily |
| `uv-index.json` | UV index | daily |
| `qualidade-agua.json` | InfoÁgua water quality | weekly |
| `match-google-places.json` | Resolve `google_place_id` + rating | monthly (incremental) |
| `popular-times.json` | SerpAPI hourly busyness | monthly (1st 06h) — dormant |
| `photos-google-places.json` | (NEW) fetch photos for `praia_fotos` | monthly |
| `nearby-places.json` | (NEW) populate `pontos_interesse` | monthly |

Workflows only run while Docker/n8n is running locally. Production: move to VPS (~€4/month).
