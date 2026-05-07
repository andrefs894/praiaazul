import { useOutletContext } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import { useFavoritas } from '../hooks/useFavoritas'
import { iconeEstadoTempo } from '../lib/utils'
import type { ContextoApp } from '../App'
import type { PraiaComMeteo } from '../types'

const C = {
  card: '#132A3A', accent: '#1A6FB5',
  text: '#E8EDF2', text2: '#7A8A9E', border: '#1A3D52', iconBox: '#1A3D52',
} as const

function CartaoFavorita({
  praia,
  onRemover,
}: {
  praia: PraiaComMeteo
  onRemover: () => void
}) {
  const m = praia.meteo

  return (
    <div style={{
      background: C.card, borderRadius: 12, padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {/* Weather icon box */}
      <Link to={`/praia/${praia.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, textDecoration: 'none', minWidth: 0 }}>
        <div style={{
          width: 40, height: 40, background: C.iconBox, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
        }}>
          {iconeEstadoTempo(m?.estado_tempo, m?.precipitacao)}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 500, color: C.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {praia.nome}
          </p>
          <p style={{ fontSize: 12, color: C.text2, margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {[praia.concelho, m?.temp_max != null ? `${m.temp_max}°C` : null, praia.distancia_minutos != null ? `~${praia.distancia_minutos} min` : null]
              .filter(Boolean).join(' · ')}
          </p>
        </div>
      </Link>

      {/* Unfavorite button */}
      <button
        onClick={onRemover}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}
        aria-label="Remover dos favoritos"
      >
        <svg width="20" height="20" viewBox="0 0 24 24"
          fill={C.accent} stroke={C.accent}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>
  )
}

export default function PaginaFavoritas() {
  const { praiaComMeteo } = useOutletContext<ContextoApp>()
  const { favoritas, toggleFavorita } = useFavoritas()

  const praiasGravadas = praiaComMeteo.filter(p => favoritas.includes(p.id))

  return (
    <div style={{ paddingBottom: 90 }}>
      <Header />

      <div style={{ maxWidth: 420, margin: '0 auto', padding: '0 20px' }}>
        {praiasGravadas.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <p style={{ fontSize: 48, margin: '0 0 16px' }}>⭐</p>
            <p style={{ fontSize: 16, color: '#7A8A9E', margin: '0 0 8px' }}>Ainda não tens praias favoritas</p>
            <p style={{ fontSize: 13, color: '#5A7A8A', margin: 0 }}>Adiciona praias tocando no ❤️ na recomendação ou na ficha de qualquer praia</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 10, fontWeight: 500, color: '#7A8A9E', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 12px 2px' }}>
              {praiasGravadas.length} {praiasGravadas.length === 1 ? 'praia guardada' : 'praias guardadas'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {praiasGravadas.map(p => (
                <CartaoFavorita
                  key={p.id}
                  praia={p}
                  onRemover={() => toggleFavorita(p.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
