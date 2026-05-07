// "Por perto" section on FichaPraia.
// Horizontal-scroll cards for top restaurants/bars/cafes within ~500m.
// Tapping a card opens that place in Google Maps.

import type { PontoInteresse } from '../types'

const C = {
  card: '#1A3D52',
  text: '#E8EDF2',
  text2: '#7A8A9E',
} as const

function tipoLabel(t: PontoInteresse['tipo']): string {
  if (t === 'restaurante') return 'Restaurante'
  if (t === 'bar')         return 'Bar'
  if (t === 'cafe')        return 'Café'
  return ''
}

function googleMapsUrl(p: PontoInteresse): string {
  // Open the specific place by its place_id (most reliable than name+coords).
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.nome)}&query_place_id=${p.google_place_id}`
}

interface Props {
  pontos: PontoInteresse[]
}

export default function PontosInteresse({ pontos }: Props) {
  if (pontos.length === 0) return null

  return (
    <div>
      <p style={{
        fontSize: 10, fontWeight: 500, color: C.text2,
        letterSpacing: '2px', textTransform: 'uppercase',
        margin: '0 0 12px',
      }}>
        Por perto
      </p>

      <div style={{
        display: 'flex',
        gap: 10,
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        paddingBottom: 4,
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}>
        {pontos.map(p => (
          <a
            key={p.id}
            href={googleMapsUrl(p)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: '0 0 200px',
              scrollSnapAlign: 'start',
              background: C.card,
              borderRadius: 12,
              overflow: 'hidden',
              textDecoration: 'none',
              color: C.text,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{
              width: '100%',
              aspectRatio: '4 / 3',
              background: '#0F1923',
              position: 'relative',
            }}>
              {p.foto_url ? (
                <img
                  src={p.foto_url}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, opacity: 0.5,
                }}>
                  {p.tipo === 'bar' ? '🍻' : p.tipo === 'cafe' ? '☕' : '🍽️'}
                </div>
              )}
            </div>
            <div style={{ padding: '10px 12px' }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: C.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.nome}
              </p>
              <p style={{ fontSize: 11, color: C.text2, margin: '4px 0 0' }}>
                {[
                  p.rating != null ? `⭐ ${p.rating.toFixed(1)}` : null,
                  p.distancia_metros != null ? `~${p.distancia_metros}m` : null,
                  tipoLabel(p.tipo),
                ].filter(Boolean).join(' · ')}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
