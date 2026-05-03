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
export type DistanciaMaxima = 15 | 30 | 60 | null // minutes; null = doesn't matter

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
}

// Result from the scoring engine
export interface RecomendacaoResult {
  praia: PraiaComMeteo
  score: number
  motivo: string // short human-readable explanation e.g. "Temperatura ideal e vento fraco"
}
