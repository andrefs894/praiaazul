import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import type { Praia, MeteoDiario, QualidadeAgua, PraiaComMeteo } from '../types'
import { dataHoje, estimarMinutos } from '../lib/utils'

export function usePraiaComMeteo(userLat: number | null, userLng: number | null) {
  const [praias, setPraias] = useState<Praia[]>([])
  const [meteo, setMeteo] = useState<MeteoDiario[]>([])
  const [qualidades, setQualidades] = useState<QualidadeAgua[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    async function carregar() {
      const [praiasRes, meteoRes, qualRes] = await Promise.all([
        supabase.from('praias').select('*'),
        supabase.from('meteo_diario').select('*').eq('data', dataHoje()),
        supabase.from('qualidade_agua').select('*'),
      ])

      if (praiasRes.error) { setErro(praiasRes.error.message); setLoading(false); return }
      if (meteoRes.error)  { setErro(meteoRes.error.message);  setLoading(false); return }

      setPraias(praiasRes.data ?? [])
      setMeteo(meteoRes.data ?? [])
      setQualidades(qualRes.data ?? [])
      setLoading(false)
    }

    carregar()
  }, [])

  // Join beaches with today's weather, water quality, and distance from user location.
  const praiaComMeteo = useMemo((): PraiaComMeteo[] => {
    const meteoMap     = new Map(meteo.map(m => [m.ipma_global_id, m]))
    const qualidadeMap = new Map(qualidades.map(q => [q.praia_id, q]))

    return praias.map(p => ({
      ...p,
      meteo:          p.ipma_global_id != null ? meteoMap.get(p.ipma_global_id) : undefined,
      qualidade_agua: qualidadeMap.get(p.id),
      distancia_minutos:
        userLat != null && userLng != null && p.latitude != null && p.longitude != null
          ? estimarMinutos(userLat, userLng, p.latitude, p.longitude)
          : undefined,
    }))
  }, [praias, meteo, qualidades, userLat, userLng])

  return { praiaComMeteo, loading, erro }
}
