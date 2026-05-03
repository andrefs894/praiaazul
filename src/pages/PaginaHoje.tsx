import { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import Header from '../components/Header'
import Mapa from '../components/Mapa'
import RecomendacaoDia, { CartaoSecundario } from '../components/RecomendacaoDia'
import { useRecomendacao } from '../hooks/useRecomendacao'
import { useFavoritas } from '../hooks/useFavoritas'
import { usePerfil } from '../hooks/usePerfil'
import { haversineKm } from '../lib/utils'
import type { ContextoApp } from '../App'

export default function PaginaHoje() {
  const { praiaComMeteo, loading, erro, coordenadas } = useOutletContext<ContextoApp>()
  const [radiusKm, setRadiusKm] = useState(50)
  const { perfil } = usePerfil()
  const { isFavorita, toggleFavorita } = useFavoritas()

  const praiasNoRaio = useMemo(() => {
    if (!coordenadas) return praiaComMeteo
    return praiaComMeteo.filter(p => {
      if (p.latitude == null || p.longitude == null) return false
      return haversineKm(coordenadas.lat, coordenadas.lng, p.latitude, p.longitude) <= radiusKm
    })
  }, [praiaComMeteo, coordenadas, radiusKm])

  const recomendacoes = useRecomendacao(praiasNoRaio, perfil)
  const topRec = recomendacoes[0]
  const outrasOpcoes = recomendacoes.slice(1)

  return (
    <div style={{ paddingBottom: 90 }}>
      <Header />

      <div style={{ maxWidth: 420, margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* 1 — Daily recommendation */}
        <RecomendacaoDia
          recomendacoes={recomendacoes}
          loading={loading}
          erro={erro}
          isFavorita={topRec ? isFavorita(topRec.praia.id) : false}
          onToggleFavorita={() => topRec && toggleFavorita(topRec.praia.id)}
        />

        {/* 2 — Map with radius overlay */}
        <Mapa
          praias={praiaComMeteo}
          recomendacoes={recomendacoes}
          coordenadas={coordenadas}
          radiusKm={radiusKm}
          onRadiusChange={setRadiusKm}
        />

        {/* 3 — Other good options */}
        {!loading && outrasOpcoes.length > 0 && (
          <section>
            <p style={{
              fontSize: 10,
              fontWeight: 500,
              color: '#7A8A9E',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              margin: '0 0 10px 2px',
            }}>
              Outras boas opções
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {outrasOpcoes.map(rec => (
                <CartaoSecundario key={rec.praia.id} rec={rec} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
