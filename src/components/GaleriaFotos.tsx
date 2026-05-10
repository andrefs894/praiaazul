import { useState } from 'react'
import type { Foto } from '../types'

interface Props {
  fotos: Foto[]
}

export default function GaleriaFotos({ fotos }: Props) {
  const [idx, setIdx] = useState(0)
  if (fotos.length === 0) return null

  const foto = fotos[idx]

  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '4 / 3', background: '#1A3D52' }}>
      <img
        src={foto.url}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />

      {fotos.length > 1 && (
        <>
          {idx > 0 && (
            <button onClick={() => setIdx(n => n - 1)} style={estiloSeta('left')}>‹</button>
          )}
          {idx < fotos.length - 1 && (
            <button onClick={() => setIdx(n => n + 1)} style={estiloSeta('right')}>›</button>
          )}
          <div style={{
            position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 5,
          }}>
            {fotos.map((_, i) => (
              <div
                key={i}
                onClick={() => setIdx(i)}
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
