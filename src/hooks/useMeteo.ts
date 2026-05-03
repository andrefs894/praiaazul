import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { MeteoDiario } from '../types'
import { dataHoje } from '../lib/utils'

// Fetches today's weather for a beach, using the beach's assigned IPMA station.
// Pass the beach's ipma_global_id (available on the Praia object after import).
export function useMeteo(ipmaGlobalId: number | null) {
  const [meteo, setMeteo] = useState<MeteoDiario | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (ipmaGlobalId == null) {
      setLoading(false)
      return
    }

    async function carregar() {
      const { data, error } = await supabase
        .from('meteo_diario')
        .select('*')
        .eq('ipma_global_id', ipmaGlobalId)
        .eq('data', dataHoje())
        .single()

      if (error) {
        setErro(error.message)
      } else {
        setMeteo(data)
      }
      setLoading(false)
    }

    carregar()
  }, [ipmaGlobalId])

  return { meteo, loading, erro }
}
