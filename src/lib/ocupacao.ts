// Heuristic beach occupation estimator.
// Real Popular Times data from Google isn't available for most Portuguese beaches,
// so we model occupation from signals we DO have:
//   - beach popularity (Google rating × review count)
//   - hour of day, day of week, month of year
//   - current weather (temperature, wind, precipitation)
//
// Output is a 0–100 busyness level + a 4-step category.
// Calibration is rough on purpose — tune the constants below as we get user feedback.

import type { Praia, MeteoDiario } from '../types'

export type CategoriaOcupacao = 'baixa' | 'moderada' | 'alta' | 'muito_alta'
export type FonteOcupacao = 'estimativa' | 'tempo_real'

export interface OcupacaoEstimada {
  nivel: number              // 0–100
  categoria: CategoriaOcupacao
  fonte: FonteOcupacao
}

// --- factors ------------------------------------------------------------

// Static popularity baseline for a beach. Higher rating + more reviews → busier.
// Beaches with no Google data fall back to a neutral 40 (mild popularity).
function basePopularity(praia: Praia): number {
  const rating = praia.google_rating
  const reviews = praia.google_review_count
  if (rating == null || reviews == null) return 40
  const fromRating = (rating - 3) * 20            // 3.0★ → 0, 4.5★ → 30, 5.0★ → 40
  const fromReviews = Math.log10(reviews + 1) * 15 // 100 reviews → 30, 1000 → 45, 10000 → 60
  return clamp(fromRating + fromReviews, 20, 100)
}

// Hour-of-day curve. Empty before 9h, peaks 13–17h, drops after 19h.
function hourFactor(hour: number): number {
  if (hour < 9)  return 0.05
  if (hour < 11) return 0.30
  if (hour < 13) return 0.70
  if (hour < 17) return 1.00
  if (hour < 19) return 0.85
  if (hour < 20) return 0.50
  if (hour < 21) return 0.20
  return 0.05
}

// Day-of-week multiplier. JS Date.getDay(): 0=Sunday … 6=Saturday.
const DAY_FACTORS = [1.4, 0.9, 0.85, 0.85, 0.9, 1.1, 1.5]
function dayFactor(dayOfWeek: number): number {
  return DAY_FACTORS[dayOfWeek] ?? 1.0
}

// Month multiplier (0=Jan … 11=Dec). Portuguese summer peaks Jul/Aug.
const MONTH_FACTORS = [0.10, 0.10, 0.15, 0.25, 0.45, 0.75, 1.00, 1.00, 0.70, 0.40, 0.15, 0.15]
function monthFactor(month: number): number {
  return MONTH_FACTORS[month] ?? 0.5
}

// Weather modifier: hot+dry+calm pushes occupation up; cold/windy/rainy pulls it down.
function weatherFactor(meteo: MeteoDiario | null | undefined): number {
  if (!meteo) return 1.0
  let f = 1.0

  const t = meteo.temp_max
  if (t != null) {
    if (t >= 24 && t <= 30) f *= 1.20
    else if (t >= 20 && t < 24) f *= 0.90
    else if (t > 30 && t <= 34) f *= 1.00
    else if (t < 20) f *= 0.50
    else f *= 0.70 // very hot (>34°C)
  }

  const w = meteo.vento_intensidade
  if (w != null) {
    if (w <= 2) f *= 1.00
    else if (w === 3) f *= 0.85
    else f *= 0.60 // strong wind
  }

  if ((meteo.precipitacao ?? 0) > 1) f *= 0.40

  return clamp(f, 0.20, 1.30)
}

// --- main API -----------------------------------------------------------

export function estimarOcupacao(
  praia: Praia,
  meteo: MeteoDiario | null | undefined,
  agora: Date = new Date()
): OcupacaoEstimada {
  const base = basePopularity(praia)
  const nivel = Math.round(
    base
    * hourFactor(agora.getHours())
    * dayFactor(agora.getDay())
    * monthFactor(agora.getMonth())
    * weatherFactor(meteo)
  )
  const clamped = clamp(nivel, 0, 100)
  return {
    nivel: clamped,
    categoria: categorizar(clamped),
    fonte: 'estimativa',
  }
}

export function categorizar(nivel: number): CategoriaOcupacao {
  if (nivel <= 25) return 'baixa'
  if (nivel <= 50) return 'moderada'
  if (nivel <= 75) return 'alta'
  return 'muito_alta'
}

export function rotuloOcupacao(categoria: CategoriaOcupacao): string {
  switch (categoria) {
    case 'baixa':      return 'Pouco lotada'
    case 'moderada':   return 'Moderada'
    case 'alta':       return 'Lotada'
    case 'muito_alta': return 'Muito lotada'
  }
}

// Returns hex colors that match the existing palette (greens/yellows/oranges/reds on dark bg)
export function corOcupacao(categoria: CategoriaOcupacao): { bg: string; fg: string; bar: string } {
  switch (categoria) {
    case 'baixa':      return { bg: 'rgba(46,160,67,0.15)',  fg: '#5BC56F', bar: '#3FB95C' }
    case 'moderada':   return { bg: 'rgba(227,179,65,0.15)', fg: '#E5C07B', bar: '#D9A441' }
    case 'alta':       return { bg: 'rgba(232,135,57,0.15)', fg: '#F0A05A', bar: '#E5803F' }
    case 'muito_alta': return { bg: 'rgba(232,73,73,0.15)',  fg: '#F07A7A', bar: '#E54545' }
  }
}

// --- utils --------------------------------------------------------------

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}
