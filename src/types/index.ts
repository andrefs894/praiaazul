// Types for the Praia Azul domain model

export interface Praia {
  id: number
  nome: string
  concelho: string | null
  distrito: string | null
  latitude: number | null
  longitude: number | null
  tipo: 'costeira' | 'fluvial' | 'albufeira' | null
  bandeira_azul: boolean
  nadador_salvador: boolean
  acessivel: boolean
  restaurante: boolean
  estacionamento: 'gratuito' | 'pago' | 'inexistente' | null
  estacionamento_capacidade: number | null
  estacionamento_distancia_metros: number | null
  descricao: string | null
  ipma_global_id: number | null  // nearest IPMA weather station, assigned on import
  google_place_id: string | null
  google_rating: number | null         // 1.0–5.0
  google_review_count: number | null
  created_at: string
}

export interface MeteoDiario {
  id: number
  ipma_global_id: number  // references IPMA station, not an individual beach
  data: string
  temp_min: number | null
  temp_max: number | null
  precipitacao: number | null
  vento_direcao: string | null
  vento_intensidade: number | null
  uv_index: number | null
  estado_tempo: string | null
  temp_agua: number | null
  ondulacao_altura: number | null
  updated_at: string
}

export interface QualidadeAgua {
  id: number
  praia_id: number
  classificacao: 'excelente' | 'boa' | 'aceitavel' | 'ma' | null
  data_analise: string | null
  updated_at: string
}

// User profile collected during onboarding
export type TipoPerfil = 'familia' | 'tranquila' | 'surf' | 'social'
export type DistanciaMaxima = 25 | 50 | 100 | 200 | null // km; null = doesn't matter

export interface PerfilUtilizador {
  tipo: TipoPerfil | null
  localizacao: { lat: number; lng: number } | null
  municipio: string | null
  distancia_maxima: DistanciaMaxima
}

// A beach with its weather data joined, used by the scoring engine
export interface PraiaComMeteo extends Praia {
  meteo?: MeteoDiario
  qualidade_agua?: QualidadeAgua
  distancia_minutos?: number // estimated drive time from user location
  distancia_km?: number      // straight-line distance from user location
  ocupacao_atual?: number | null // 0–100 busyness; null = no data
  ocupacao_fonte?: 'estimativa' | 'tempo_real' | null
}

// Beach photo, sourced from Google Places Photos API.
// Attribution must be displayed alongside the photo per Google ToS.
export interface Foto {
  id: number
  praia_id: number
  url: string
  largura: number | null
  altura: number | null
  attribution: string | null  // e.g. "Photo by John Doe"
  ordem: number               // 0 = primary
  fonte: string | null        // 'google_places' | 'wikimedia' | ...
}

// Nearby restaurant / bar / cafe within ~500m of a beach.
// Refreshed monthly via n8n; ranked by rating × log(review_count).
export interface PontoInteresse {
  id: number
  praia_id: number
  google_place_id: string
  nome: string
  tipo: 'restaurante' | 'bar' | 'cafe' | string | null
  rating: number | null
  review_count: number | null
  foto_url: string | null
  foto_attr: string | null
  latitude: number | null
  longitude: number | null
  distancia_metros: number | null
  endereco: string | null
}

// Result from the scoring engine
export interface RecomendacaoResult {
  praia: PraiaComMeteo
  score: number
  motivo: string // short human-readable explanation e.g. "Temperatura ideal e vento fraco"
}
