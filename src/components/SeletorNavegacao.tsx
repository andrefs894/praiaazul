import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

// Bottom-sheet chooser for "Como chegar".
// Lets the user pick Google Maps / Waze / Apple Maps (Apple only on iOS).
// Each URL is a universal link: opens the native app if installed, else web.

const C = {
  navy: '#1E3A5F',
  cream: '#EDE3CD',
  creamText: '#F5EFE0',
  white: '#FFFFFF',
  navyDim: 'rgba(30,58,95,0.55)',
  pillBorder: 'rgba(30,58,95,0.18)',
} as const

type Destino = { lat: number; lon: number; nome: string }

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function buildOpcoes(d: Destino) {
  const opcoes: { id: string; label: string; url: string }[] = [
    {
      id: 'google',
      label: 'Google Maps',
      url: `https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lon}`,
    },
    {
      id: 'waze',
      label: 'Waze',
      url: `https://waze.com/ul?ll=${d.lat},${d.lon}&navigate=yes`,
    },
  ]
  if (isIOS()) {
    opcoes.push({
      id: 'apple',
      label: 'Apple Maps',
      url: `https://maps.apple.com/?daddr=${d.lat},${d.lon}`,
    })
  }
  return opcoes
}

export function useSeletorNavegacao() {
  const [destino, setDestino] = useState<Destino | null>(null)

  const abrir = (lat: number | null | undefined, lon: number | null | undefined, nome: string) => {
    if (lat == null || lon == null) return
    setDestino({ lat, lon, nome })
  }
  const fechar = () => setDestino(null)

  const sheet = destino ? <Sheet destino={destino} onClose={fechar} /> : null

  return { abrir, sheet }
}

function Sheet({ destino, onClose }: { destino: Destino; onClose: () => void }) {
  const opcoes = buildOpcoes(destino)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Como chegar"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(30,58,95,0.55)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 72px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'calc(100% - 16px)', maxWidth: 404,
          background: C.cream,
          borderRadius: 22,
          padding: '14px 20px 20px',
          boxShadow: '0 -8px 24px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: C.pillBorder, margin: '0 auto 14px',
        }} />
        <p style={{
          fontSize: 11, fontWeight: 600, color: C.navyDim,
          letterSpacing: '2px', textTransform: 'uppercase',
          margin: '0 0 4px', textAlign: 'center',
        }}>
          Como chegar
        </p>
        <p style={{
          fontSize: 15, color: C.navy, margin: '0 0 16px',
          textAlign: 'center', fontWeight: 500,
        }}>
          {destino.nome}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {opcoes.map(o => (
            <a
              key={o.id}
              href={o.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              style={{
                background: C.white,
                color: C.navy,
                borderRadius: 14,
                padding: '14px 18px',
                fontSize: 15, fontWeight: 500,
                textDecoration: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                border: `1px solid ${C.pillBorder}`,
              }}
            >
              <span>{o.label}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            width: '100%', marginTop: 14,
            background: 'transparent', border: 'none',
            color: C.navyDim, fontSize: 14, fontWeight: 500,
            padding: '12px', cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    </div>,
    document.body,
  )
}
