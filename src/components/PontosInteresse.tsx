import { useState, useEffect } from 'react'
import type { PontoInteresse } from '../types'

const C = {
  card: '#1A3D52',
  text: '#E8EDF2',
  text2: '#7A8A9E',
  accent: '#1A6FB5',
} as const

const FOTO_ALTURA = 160

const FILTROS = [
  { key: null,          label: 'Todos'       },
  { key: 'restaurante', label: 'Restaurante' },
  { key: 'bar',         label: 'Bar'         },
  { key: 'cafe',        label: 'Café'        },
] as const

type Filtro = null | 'restaurante' | 'bar' | 'cafe'

function tipoLabel(t: PontoInteresse['tipo']): string {
  if (t === 'restaurante') return 'Restaurante'
  if (t === 'bar')         return 'Bar'
  if (t === 'cafe')        return 'Café'
  return ''
}

function googleMapsUrl(p: PontoInteresse): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.nome)}&query_place_id=${p.google_place_id}`
}

interface Props {
  pontos: PontoInteresse[]
}

export default function PontosInteresse({ pontos }: Props) {
  const [filtro, setFiltro] = useState<Filtro>(null)
  const [idx, setIdx] = useState(0)

  const visiveis = filtro ? pontos.filter(p => p.tipo === filtro) : pontos

  useEffect(() => { setIdx(0) }, [filtro])

  if (pontos.length === 0) return null

  const tipos = new Set(pontos.map(p => p.tipo).filter(Boolean))
  const p = visiveis[idx]

  return (
    <div>
      {/* Section label */}
      <p style={{
        fontSize: 10, fontWeight: 500, color: C.text2,
        letterSpacing: '2px', textTransform: 'uppercase',
        margin: '0 0 10px',
      }}>
        Por perto
      </p>

      {/* Type filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {FILTROS.filter(f => f.key === null || tipos.has(f.key)).map(f => (
          <button
            key={f.key ?? 'todos'}
            onClick={() => setFiltro(f.key as Filtro)}
            style={estiloPilula(filtro === f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Empty filtered state */}
      {visiveis.length === 0 && (
        <div style={{ background: C.card, borderRadius: 12, padding: '20px 14px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: C.text2, margin: 0 }}>
            Sem {filtro ? tipoLabel(filtro).toLowerCase() + 's' : 'locais'} por perto.
          </p>
        </div>
      )}

      {/* Card with arrows overlaid on the photo */}
      {p && (
        <a
          href={googleMapsUrl(p)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: C.card,
            borderRadius: 12,
            overflow: 'hidden',
            textDecoration: 'none',
            color: C.text,
          }}
        >
          {/* Photo with navigation arrows + dots */}
          <div style={{ position: 'relative', width: '100%', height: FOTO_ALTURA, background: '#0F1923', flexShrink: 0 }}>
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
                fontSize: 36, opacity: 0.4,
              }}>
                {p.tipo === 'bar' ? '🍻' : p.tipo === 'cafe' ? '☕' : '🍽️'}
              </div>
            )}

            {visiveis.length > 1 && (
              <>
                {idx > 0 && (
                  <button
                    onClick={e => { e.preventDefault(); setIdx(n => n - 1) }}
                    style={estiloSeta('left')}
                  >‹</button>
                )}
                {idx < visiveis.length - 1 && (
                  <button
                    onClick={e => { e.preventDefault(); setIdx(n => n + 1) }}
                    style={estiloSeta('right')}
                  >›</button>
                )}
                <div style={{
                  position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', gap: 5,
                }}>
                  {visiveis.map((_, i) => (
                    <div
                      key={i}
                      onClick={e => { e.preventDefault(); setIdx(i) }}
                      style={{
                        width: i === idx ? 16 : 6,
                        height: 6,
                        borderRadius: 3,
                        background: i === idx ? 'white' : 'rgba(255,255,255,0.4)',
                        transition: 'width 0.2s',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Text */}
          <div style={{ padding: '12px 14px' }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: C.text, margin: 0 }}>{p.nome}</p>
            <p style={{ fontSize: 12, color: C.text2, margin: '5px 0 0' }}>
              {[
                p.rating != null ? `⭐ ${p.rating.toFixed(1)}` : null,
                p.distancia_metros != null ? `~${p.distancia_metros}m` : null,
                tipoLabel(p.tipo),
              ].filter(Boolean).join(' · ')}
            </p>
            {p.endereco && (
              <p style={{ fontSize: 11, color: C.text2, margin: '4px 0 0', opacity: 0.7 }}>{p.endereco}</p>
            )}
          </div>
        </a>
      )}
    </div>
  )
}

function estiloSeta(lado: 'left' | 'right') {
  return {
    position: 'absolute' as const,
    top: '50%',
    [lado]: 10,
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.45)',
    border: 'none',
    color: 'white',
    fontSize: 22,
    width: 34,
    height: 34,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
  }
}

function estiloPilula(ativo: boolean) {
  return {
    background: ativo ? C.accent : 'transparent',
    border: `0.5px solid ${ativo ? C.accent : 'rgba(122,138,158,0.4)'}`,
    color: ativo ? 'white' : C.text2,
    fontSize: 12,
    padding: '5px 12px',
    borderRadius: 20,
    cursor: 'pointer',
  }
}
