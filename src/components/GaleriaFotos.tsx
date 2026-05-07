// Horizontal-scroll photo gallery used on FichaPraia.
// Each image shows its Google Places attribution as a small overlay
// (required by Google ToS).

import type { Foto } from '../types'

interface Props {
  fotos: Foto[]
}

export default function GaleriaFotos({ fotos }: Props) {
  if (fotos.length === 0) return null

  return (
    <div style={{
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      // Scroll-snap each photo into view as the user swipes.
      scrollSnapType: 'x mandatory',
      paddingBottom: 4,
      // Hide scrollbar in WebKit; Firefox uses `scrollbar-width: none` via index.css.
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',
    }}>
      {fotos.map(f => (
        <div
          key={f.id}
          style={{
            position: 'relative',
            flex: '0 0 88%',
            scrollSnapAlign: 'start',
            borderRadius: 12,
            overflow: 'hidden',
            aspectRatio: '4 / 3',
            background: '#1A3D52',
          }}
        >
          <img
            src={f.url}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {f.attribution && (
            <div style={{
              position: 'absolute',
              bottom: 6, right: 6,
              background: 'rgba(0,0,0,0.55)',
              color: 'rgba(255,255,255,0.85)',
              fontSize: 10,
              padding: '3px 7px',
              borderRadius: 6,
              maxWidth: '70%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {f.attribution}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
