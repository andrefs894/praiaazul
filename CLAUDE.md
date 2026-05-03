# CLAUDE.md — Praia Azul

## What is this project

**Praia Azul** is a Portuguese PWA (Progressive Web App) that answers the question "What's the best beach for me, today?" in 3 seconds. It's not a weather app or a data dashboard — it's a decision assistant that cross-references weather, crowd levels, wind, user profile and available services to deliver a personalized recommendation.

The long-term vision is to expand beyond beaches into hiking trails, viewpoints, hot springs, and outdoor experiences across Portugal.

## Business context

- Target market: Portugal (B2C, end consumers)
- Existing competitors: Info Praia (APA), MEO Beachcam, Praia em Directo — all are data dashboards, none solve the user's decision
- MVP goal: validate the idea in summer 2026, target 1,000 users
- Future monetization (2027+): partnerships with beach concessions, booking commissions, municipal data reports, contextual advertising
- Portugal has ~600 classified beaches, ~10M residents + ~20M tourists/year

## Tech stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | **React + Vite (PWA)** | TypeScript. Must work as a mobile app without App Store. |
| Styling | **Tailwind CSS** | Mobile-first, responsive |
| Backend/DB | **Supabase** (PostgreSQL + Auth + auto-generated REST API) | Free tier. Project already created. |
| Maps | **Leaflet** (free) or **Mapbox GL JS** (free tier) | Decision pending |
| Data ingestion | **n8n** (self-hosted via Docker, local) | Runs locally on dev machine. Scheduled workflows to call APIs and populate Supabase. |
| Deployment (future) | **Vercel** | Do NOT configure now. Deployment comes later. |

### Development environment notes
- Developer uses **Windows** with **VS Code**
- **Docker Desktop** is installed and running **n8n** locally at `http://localhost:5678`
- Developer knows how to code but has never built apps — keep code simple, well-commented, and explain technical decisions
- The app UI, user-facing content, and variable/function naming related to domain concepts should be in **Portuguese** (e.g., `praias`, `meteo_diario`, `recomendacao`). Code comments can be in English or Portuguese.

## Database schema (Supabase)

### Table: `praias`
Static data about each beach, imported from APA/dados.gov.pt.

```sql
CREATE TABLE praias (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  concelho TEXT,
  distrito TEXT,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  tipo TEXT, -- 'costeira', 'fluvial', 'albufeira'
  bandeira_azul BOOLEAN DEFAULT FALSE,
  nadador_salvador BOOLEAN DEFAULT FALSE,
  acessivel BOOLEAN DEFAULT FALSE,
  restaurante BOOLEAN DEFAULT FALSE,
  estacionamento TEXT, -- 'gratuito', 'pago', 'inexistente'
  estacionamento_capacidade INTEGER,
  estacionamento_distancia_metros INTEGER,
  descricao TEXT,
  ipma_global_id INTEGER,  -- nearest IPMA weather station (assigned on import)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `meteo_diario`
Weather data updated 2x/day via n8n (IPMA API).
Stores one row per **IPMA station** per day (35 stations × 5 forecast days = ~175 rows/run).
Each beach in `praias` has an `ipma_global_id` pointing to its nearest station.

```sql
CREATE TABLE meteo_diario (
  id SERIAL PRIMARY KEY,
  ipma_global_id INTEGER NOT NULL,
  data DATE NOT NULL,
  temp_min DECIMAL(4,1),
  temp_max DECIMAL(4,1),
  precipitacao DECIMAL(5,1),
  vento_direcao TEXT,
  vento_intensidade INTEGER,
  uv_index INTEGER,
  estado_tempo TEXT,
  temp_agua DECIMAL(4,1),
  ondulacao_altura DECIMAL(3,1),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ipma_global_id, data)
);
```

### Table: `qualidade_agua`
Bathing water quality data, updated weekly via n8n.

```sql
CREATE TABLE qualidade_agua (
  id SERIAL PRIMARY KEY,
  praia_id INTEGER REFERENCES praias(id),
  classificacao TEXT, -- 'excelente', 'boa', 'aceitavel', 'ma'
  data_analise DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Data sources (free APIs)

### 1. Weather — IPMA (Instituto Português do Mar e da Atmosfera)
- **Endpoint:** `https://api.ipma.pt/open-data/forecast/meteorology/cities/daily/{globalIdLocal}.json`
- **Data:** Temperature min/max, precipitation, wind (direction + intensity), weather state, UV
- **Update frequency:** 2x/day (00h and 12h UTC)
- **Cost:** Free, open, no authentication
- **Note:** Good practice to email `webmaster@ipma.pt` to inform of usage

### 2. Beach list and services — APA / SNIAmb ArcGIS REST API
- **Endpoint:** `https://sniambgeoogc.apambiente.pt/getogc/rest/services/SNIAmb/Praias/MapServer/0/query`
- **Params:** `where=1=1&outFields=*&returnGeometry=true&f=json&resultRecordCount=2000`
- **Data:** ~760 beaches with name, municipality, coordinates, type, services (lifeguard, accessible, restaurant, parking, Blue Flag)
- **Format:** ArcGIS JSON (geometry.x/y in WGS84, attributes as integers 0/1)
- **Cost:** Free, open data
- **Note:** One-time import via n8n (`importar-praias.json`). `categoria_agua_balnear`: 1=costeira, 2=fluvial, 3=albufeira

### 3. Water quality — InfoÁgua (APA)
- **URL:** `https://infoagua.apambiente.pt/`
- **Data:** Bathing water classification, alerts, analysis results
- **Note:** Launched in 2025 — check if it has a documented API or if scraping is needed

### 4. Sea swell and conditions — IPMA
- **URL:** `https://api.ipma.pt/` (sea state section)
- **Data:** Wave height, period, swell direction, water temperature
- **Update frequency:** Daily

### 5. Tides — Instituto Hidrográfico
- **URL:** `https://www.hidrografico.pt/`
- **Data:** Tide tables, high/low tide times
- **Note:** No official API — may need scraping or a static annual dataset

### 6. Traffic estimation (proxy for parking occupancy)
- **Google Maps Directions API:** Traffic on access roads
- **Cost:** $200/month free credit from Google Cloud
- **Note:** DO NOT implement in the MVP. For the MVP, use only static parking info.

## n8n workflows (data ingestion)

n8n runs locally via Docker. Workflows connect to Supabase cloud via Postgres credentials.

**Postgres credentials for n8n:**
- Host: `db.[PROJECT_ID].supabase.co`
- Database: `postgres`
- User: `postgres`
- Password: [password set during project creation]
- Port: `5432`

### Workflow 1 — Import beaches (one-time execution)
`Manual trigger → HTTP Request (dados.gov.pt, APA beach dataset) → Transform data → Insert into Supabase (praias table)`

### Workflow 2 — Daily weather (2x/day)
`Schedule (cron 00h and 12h) → HTTP Request (IPMA API per district) → Transform data → Upsert into Supabase (meteo_diario table)`

### Workflow 3 — Water quality (weekly)
`Schedule (weekly cron) → HTTP Request (InfoÁgua/APA) → Transform data → Upsert into Supabase (qualidade_agua table)`

**Note:** Workflows only run while Docker/n8n is running on the dev machine. In production, n8n will be moved to a VPS (~€4/month).

## MVP features (Phase 1)

### 1. Daily recommendation (CORE — the main feature)
User opens the app and immediately sees the best beach for their profile.

Example output:
> "Hoje a melhor praia para ti é: Praia da Arrábida"
> ☀️ 28°C · 🌊 Água 20°C · 💨 Vento fraco · 🟢 Lotação baixa
> 📍 35 min de carro · 🅿️ Parque gratuito (~200 lugares)

**Scoring algorithm:**
```
score = (weight_temp × score_temperature)
      + (weight_wind × score_wind)
      + (weight_crowd × score_crowd)
      + (weight_distance × score_distance)
      + (weight_profile × score_profile_match)
```
Weights adjust based on user profile.

### 2. Quick profile (onboarding in 3 taps)
- What are you looking for? (Family / Quiet / Surf / Social)
- Where are you? (Geolocation or municipality)
- How far are you willing to drive? (15min / 30min / 1h / Doesn't matter)

### 3. Beach list with filters
- By type: Coastal / River
- By services: Lifeguard / Bar / Accessible
- By award: Blue Flag
- By distance

### 4. Beach detail page
- Today's weather (IPMA)
- Water quality (APA)
- Services and equipment
- Photos (initially from Google Places, later crowdsourced)
- Map with directions

### 5. Favorites
Save favorite beaches (localStorage or Supabase Auth in the future).

### 6. Parking info (static)
- Is there parking? Yes/No
- Free/Paid
- Type (asphalt / dirt / street)
- Estimated capacity
- Distance to the sand

## Phase 2 features (DO NOT implement now)

These features come after having real users:
- Parking crowdsourcing ("Did you find a spot?")
- User-shared daily photos
- Proactive notifications ("Your favorite beach is 24°C!")
- Social component (see where friends are)
- Local business integration (bookings, food, equipment rental)
- Expansion to hiking trails, viewpoints, hot springs

## Development timeline (8 weeks)

| Week | Focus | Deliverable |
|------|-------|------------|
| 1 | Setup + Data | React project created. Supabase DB with tables. Beach data imported via n8n. IPMA API integrated. |
| 2 | Recommendation engine | Working scoring algorithm. Function that receives location + profile → returns top 5 beaches. |
| 3 | UI — Main screen | Daily recommendation card. Map with nearby beaches. |
| 4 | UI — Beach detail + Filters | Detail page with consolidated data. Filter system on the list. |
| 5 | Profile + Favorites + PWA | 3-step onboarding. Save preferences. PWA manifest for mobile install. |
| 6 | Parking info | Manual research and input of parking data for the ~50 most popular beaches. |
| 7 | Testing + Polish | Test with 5-10 friends. Bug fixes. Optimize mobile performance. |
| 8 | Soft launch | Domain active. Deploy on Vercel. Share on social media, friend groups, forums. |

## Development principles

- **Mobile-first** — Most users will be on their phones. Design for mobile first.
- **Simplicity** — Less is more. Each screen should have a clear purpose.
- **Performance** — The recommendation must appear in <3 seconds. Aggressive caching of weather data.
- **Offline-ready** — Static beach data should work offline (PWA with service worker).
- **Clean, commented code** — The developer is learning. Explain the "why", not just the "what".
- **Frequent commits** — Small, descriptive commits.
- **Don't over-engineer** — This is an MVP. Don't add unnecessary complexity. If a simple solution works, use the simple solution.

## Expected folder structure

```
praia-azul/
├── CLAUDE.md              # This file
├── README.md              # Public project description
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── public/
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service worker
│   └── icons/             # App icons
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css          # Tailwind imports
│   ├── components/
│   │   ├── RecomendacaoDia.tsx    # Main recommendation card
│   │   ├── ListaPraias.tsx        # List with filters
│   │   ├── FichaPraia.tsx         # Detail page
│   │   ├── Mapa.tsx               # Map component
│   │   ├── Perfil.tsx             # Onboarding and preferences
│   │   └── Favoritos.tsx          # Favorites list
│   ├── hooks/
│   │   ├── usePraias.ts           # Fetch and cache beaches
│   │   ├── useMeteo.ts            # Fetch weather data
│   │   ├── useRecomendacao.ts     # Recommendation engine logic
│   │   └── useLocalizacao.ts      # User geolocation
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client
│   │   ├── scoring.ts             # Scoring algorithm
│   │   └── utils.ts               # General utilities
│   └── types/
│       └── index.ts               # TypeScript types
└── n8n/
    └── workflows/                 # JSON exports of n8n workflows (for backup)
```

## Known risks and mitigations

| Risk | Mitigation |
|------|-----------|
| APA/IPMA APIs unstable or lacking data | Aggressive caching. Static data as fallback. |
| Parking data non-existent for most beaches | Start with static info for the 50 most popular beaches. |
| Seasonality (app dies in winter) | Expand to trails, viewpoints, hot springs in the future. |
| Not enough time to finish before summer | Prioritize ruthlessly: recommendation + beach detail page = enough to launch. |
