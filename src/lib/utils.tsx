import React from 'react'

// General utility functions

// Straight-line distance in km between two lat/lng points (Haversine formula)
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Rough driving-time estimate: air distance × detour factor ÷ average speed.
// Tuned for the Lisboa/Sintra/Cascais coast: winding N-roads, urban stretches,
// roundabouts — not highway. 1.4× detour, 45 km/h average.
export function estimarMinutos(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const km = haversineKm(lat1, lon1, lat2, lon2)
  return Math.max(5, Math.round(km * 1.4 / 45 * 60))
}

// Returns today's date as a YYYY-MM-DD string (used to query meteo_diario)
export function dataHoje(): string {
  return new Date().toISOString().split('T')[0]
}

// Converts wind intensity code (IPMA 0–9 scale) to a human-readable Portuguese label
export function labelVento(intensidade: number | null | undefined): string {
  if (intensidade == null) return 'Desconhecido'
  const labels = ['Calmo', 'Muito fraco', 'Fraco', 'Moderado', 'Moderado a forte', 'Forte', 'Muito forte', 'Tempestuoso', 'Violento', 'Furacão']
  return labels[Math.min(intensidade, labels.length - 1)]
}

// Maps IPMA weather state text to an SVG icon component.
// Pass precipitacao so rain/shower icons aren't shown when precipitation probability is 0.
export function iconeEstadoTempo(estado: string | null | undefined, precipitacao?: number | null, size: number = 24): React.ReactNode {
  if (!estado) return <IcWeatherPartlyCloudy size={size} />
  const s = estado.toLowerCase()
  if (s.includes('limpo')) return <IcWeatherSunny size={size} />
  if (s.includes('pouco nublado') || s.includes('parcialmente')) return <IcWeatherPartlyCloudy size={size} />
  if (s.includes('muito nublado') || s.includes('encoberto')) return <IcWeatherCloudy size={size} />
  if (s.includes('trovoada')) return <IcWeatherThunderstorm size={size} />
  if (s.includes('neve')) return <IcWeatherSnow size={size} />
  if (s.includes('nevoeiro')) return <IcWeatherFog size={size} />
  if (s.includes('chuva') || s.includes('aguaceiro')) {
    return precipitacao === 0 ? <IcWeatherPartlyCloudy size={size} /> : <IcWeatherRain size={size} />
  }
  return <IcWeatherPartlyCloudy size={size} />
}

// Weather icon components — Meteocons-inspired, professional weather app style.
// Colors are hard-coded so the icons look the same on light or dark backgrounds.
const W = {
  sun:        '#FDB813', // warm yellow-orange sun
  sunStroke:  '#F4A100',
  cloud:      '#E8EEF3', // light cloud fill
  cloudEdge:  '#B8C5D1', // cloud outline / shadow side
  cloudDark:  '#9AAAB8', // darker cloud for storms
  rain:       '#4FA8E0', // raindrop blue
  bolt:       '#FFD23F', // lightning yellow
  snow:       '#E8F1F8', // snowflake white
  snowEdge:   '#A8BDD0',
  fog:        '#B8C5D1',
}

function IcWeatherSunny({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Rays */}
      <g stroke={W.sunStroke} strokeWidth="2" strokeLinecap="round">
        <line x1="16" y1="3"  x2="16" y2="6" />
        <line x1="16" y1="26" x2="16" y2="29" />
        <line x1="3"  y1="16" x2="6"  y2="16" />
        <line x1="26" y1="16" x2="29" y2="16" />
        <line x1="6.7"  y1="6.7"  x2="8.8"  y2="8.8" />
        <line x1="23.2" y1="23.2" x2="25.3" y2="25.3" />
        <line x1="6.7"  y1="25.3" x2="8.8"  y2="23.2" />
        <line x1="23.2" y1="8.8"  x2="25.3" y2="6.7" />
      </g>
      {/* Sun body */}
      <circle cx="16" cy="16" r="7" fill={W.sun} stroke={W.sunStroke} strokeWidth="1.5" />
    </svg>
  )
}

function IcWeatherPartlyCloudy({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Sun (top-left, partly hidden) */}
      <g stroke={W.sunStroke} strokeWidth="1.6" strokeLinecap="round">
        <line x1="11" y1="2"  x2="11" y2="4" />
        <line x1="2"  y1="11" x2="4"  y2="11" />
        <line x1="4.5" y1="4.5" x2="6"  y2="6" />
        <line x1="17.5" y1="4.5" x2="16" y2="6" />
        <line x1="4.5" y1="17.5" x2="6" y2="16" />
      </g>
      <circle cx="11" cy="11" r="5" fill={W.sun} stroke={W.sunStroke} strokeWidth="1.3" />
      {/* Cloud (front, bottom-right) */}
      <path
        d="M23.5 26H11a5 5 0 0 1-0.6-9.96A6 6 0 0 1 22.4 17.2 4.5 4.5 0 0 1 23.5 26z"
        fill={W.cloud}
        stroke={W.cloudEdge}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IcWeatherCloudy({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Back cloud (darker, peeking) */}
      <path
        d="M27 18.5a4 4 0 0 1-2.8 3.8 4.5 4.5 0 0 0-3.4-5.6 6 6 0 0 0-9.4-3.3A4 4 0 0 1 18 11a4.5 4.5 0 0 1 4.5 4.1A4 4 0 0 1 27 18.5z"
        fill={W.cloudEdge}
      />
      {/* Front cloud (lighter) */}
      <path
        d="M22.5 26H9.5a5 5 0 0 1-0.6-9.96A6.5 6.5 0 0 1 21.4 17.2 4.5 4.5 0 0 1 22.5 26z"
        fill={W.cloud}
        stroke={W.cloudEdge}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IcWeatherRain({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Cloud */}
      <path
        d="M23 21H10a5 5 0 0 1-0.6-9.96A6.5 6.5 0 0 1 21.9 12.2 4.5 4.5 0 0 1 23 21z"
        fill={W.cloud}
        stroke={W.cloudEdge}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Raindrops */}
      <g fill={W.rain}>
        <path d="M11 24c-0.5 1-1 2-1 2.7a1 1 0 1 0 2 0c0-0.7-0.5-1.7-1-2.7z" />
        <path d="M16 25c-0.5 1-1 2-1 2.7a1 1 0 1 0 2 0c0-0.7-0.5-1.7-1-2.7z" />
        <path d="M21 24c-0.5 1-1 2-1 2.7a1 1 0 1 0 2 0c0-0.7-0.5-1.7-1-2.7z" />
      </g>
    </svg>
  )
}

function IcWeatherThunderstorm({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Dark storm cloud */}
      <path
        d="M23 21H10a5 5 0 0 1-0.6-9.96A6.5 6.5 0 0 1 21.9 12.2 4.5 4.5 0 0 1 23 21z"
        fill={W.cloudDark}
        stroke="#7C8B9A"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Lightning bolt */}
      <path
        d="M16.5 21l-3.5 5h2.7l-1.2 4 4.5-6h-2.6l1.6-3z"
        fill={W.bolt}
        stroke="#E5B82E"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IcWeatherSnow({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Cloud */}
      <path
        d="M23 21H10a5 5 0 0 1-0.6-9.96A6.5 6.5 0 0 1 21.9 12.2 4.5 4.5 0 0 1 23 21z"
        fill={W.cloud}
        stroke={W.cloudEdge}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Snowflakes */}
      <g stroke={W.snowEdge} strokeWidth="1.4" strokeLinecap="round">
        <line x1="11" y1="24" x2="11" y2="28" />
        <line x1="9"  y1="26" x2="13" y2="26" />
        <line x1="16" y1="24" x2="16" y2="28" />
        <line x1="14" y1="26" x2="18" y2="26" />
        <line x1="21" y1="24" x2="21" y2="28" />
        <line x1="19" y1="26" x2="23" y2="26" />
      </g>
    </svg>
  )
}

function IcWeatherFog({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Cloud */}
      <path
        d="M23 18H10a5 5 0 0 1-0.6-9.96A6.5 6.5 0 0 1 21.9 9.2 4.5 4.5 0 0 1 23 18z"
        fill={W.cloud}
        stroke={W.cloudEdge}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Fog lines */}
      <g stroke={W.fog} strokeWidth="2" strokeLinecap="round">
        <line x1="6"  y1="22" x2="26" y2="22" />
        <line x1="8"  y1="26" x2="24" y2="26" />
        <line x1="11" y1="30" x2="22" y2="30" />
      </g>
    </svg>
  )
}

// Converts water quality classification to a hex colour for inline styles
export function corQualidadeAgua(classificacao: string | null | undefined): string {
  switch (classificacao) {
    case 'excelente': return '#3DD9C4'
    case 'boa':       return '#1A6FB5'
    case 'aceitavel': return '#F5A623'
    case 'ma':        return '#E05252'
    default:          return '#7A8A9E'
  }
}

// Display label for water quality
export function labelQualidadeAgua(classificacao: string | null | undefined): string {
  switch (classificacao) {
    case 'excelente': return 'Excelente'
    case 'boa':       return 'Boa'
    case 'aceitavel': return 'Moderada'
    case 'ma':        return 'Má'
    default:          return '—'
  }
}

// UV risk tier label — word only, no number
export function labelUV(uv: number | null | undefined): string {
  if (uv == null) return '—'
  if (uv <= 2)  return 'Baixo'
  if (uv <= 5)  return 'Moderado'
  if (uv <= 7)  return 'Alto'
  if (uv <= 10) return 'Muito Alto'
  return 'Extremo'
}
