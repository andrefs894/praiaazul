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

// Rough driving-time estimate: air distance × detour factor ÷ average speed
export function estimarMinutos(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const km = haversineKm(lat1, lon1, lat2, lon2)
  return Math.max(5, Math.round(km * 1.3 / 80 * 60))
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

// Maps IPMA weather state text to an emoji icon.
// Pass precipitacao so rain/shower icons aren't shown when precipitation probability is 0.
export function iconeEstadoTempo(estado: string | null | undefined, precipitacao?: number | null): string {
  if (!estado) return '🌤️'
  const s = estado.toLowerCase()
  if (s.includes('limpo')) return '☀️'
  if (s.includes('pouco nublado') || s.includes('parcialmente')) return '🌤️'
  if (s.includes('muito nublado') || s.includes('encoberto')) return '☁️'
  if (s.includes('trovoada')) return '⛈️'
  if (s.includes('neve')) return '🌨️'
  if (s.includes('nevoeiro')) return '🌫️'
  if (s.includes('chuva') || s.includes('aguaceiro')) {
    // If precipitation probability is 0, the rain didn't materialise
    return precipitacao === 0 ? '🌤️' : '🌧️'
  }
  return '🌤️'
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
