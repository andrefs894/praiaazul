import { useMemo } from 'react'
import type { PraiaComMeteo, PerfilUtilizador, RecomendacaoResult } from '../types'
import { calcularScore } from '../lib/scoring'
import { labelVento } from '../lib/utils'

// Receives beaches (with weather already joined) and a user profile,
// returns the top 5 ranked beaches.
export function useRecomendacao(
  praias: PraiaComMeteo[],
  perfil: PerfilUtilizador
): RecomendacaoResult[] {
  return useMemo(() => {
    if (praias.length === 0) return []

    return praias
      .map((praia): RecomendacaoResult => {
        const score = calcularScore(praia, perfil)
        const temp = praia.meteo?.temp_max
        const vento = praia.meteo?.vento_intensidade
        const motivo = [
          temp != null ? `${temp}°C` : null,
          vento != null ? labelVento(vento).toLowerCase() : null,
        ]
          .filter(Boolean)
          .join(' · ') || 'Boa opção para hoje'

        return { praia, score, motivo }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }, [praias, perfil])
}
