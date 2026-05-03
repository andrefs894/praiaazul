import { useState } from 'react'
import type { PerfilUtilizador } from '../types'

const CHAVE = 'praia_azul_perfil'
const PADRAO: PerfilUtilizador = {
  tipo: 'familia',
  localizacao: null,
  municipio: null,
  distancia_maxima: null,
}

function ler(): PerfilUtilizador {
  try {
    const raw = localStorage.getItem(CHAVE)
    return raw ? { ...PADRAO, ...JSON.parse(raw) } : PADRAO
  } catch {
    return PADRAO
  }
}

export function usePerfil() {
  const [perfil, setPerfil] = useState<PerfilUtilizador>(ler)

  function atualizar(changes: Partial<PerfilUtilizador>) {
    setPerfil(prev => {
      const next = { ...prev, ...changes }
      localStorage.setItem(CHAVE, JSON.stringify(next))
      return next
    })
  }

  return { perfil, atualizar }
}
