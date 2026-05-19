// Visual indicator for beach occupation (0–100 busyness level).
// Renders a colored pill with category label and a thin progress bar.
// Two layouts:
//   - "compact": single row pill — fits inside RecomendacaoDia next to weather.
//   - "card":    full-width block — used as a section in FichaPraia.

import { categorizar, rotuloOcupacao, corOcupacao } from '../lib/ocupacao'
import type { FonteOcupacao, CategoriaOcupacao } from '../lib/ocupacao'

interface Props {
  nivel: number | null | undefined
  fonte?: FonteOcupacao | null
  variant?: 'compact' | 'card'
}

const TOOLTIP = 'Estimativa baseada na popularidade da praia, hora do dia, dia da semana e meteorologia.'

export default function IndicadorOcupacao({ nivel, fonte, variant = 'compact' }: Props) {
  if (nivel == null) return null

  const categoria = categorizar(nivel)
  const cor = corOcupacao(categoria)
  const rotulo = rotuloOcupacao(categoria)
  const isEstimate = fonte !== 'tempo_real'

  if (variant === 'card') {
    return (
      <div style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        boxShadow: '0 1px 3px rgba(30,58,95,0.06)',
      }}>
        <p style={{
          fontSize: 11, fontWeight: 600, color: 'rgba(30,58,95,0.55)',
          letterSpacing: '2.5px', textTransform: 'uppercase',
          margin: '0 0 14px',
        }}>
          Lotação prevista
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <IconePessoas categoria={categoria} size={28} color={cor.bar} />
          <span style={{ fontSize: 18, fontWeight: 600, color: cor.bar, flex: 1 }}>{rotulo}</span>
          <span style={{ fontSize: 12, color: 'rgba(30,58,95,0.55)' }}>{nivel}%</span>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 6, borderRadius: 3,
          background: 'rgba(30,58,95,0.08)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${nivel}%`,
            background: cor.bar,
            transition: 'width 0.3s ease',
          }} />
        </div>

        <p style={{ fontSize: 11, color: 'rgba(30,58,95,0.55)', margin: '14px 0 0', lineHeight: 1.5 }}>
          {isEstimate
            ? 'Estimativa baseada na popularidade da praia, hora do dia, dia da semana e meteorologia. Não é uma medição em tempo real.'
            : 'Dados em tempo real.'}
        </p>
      </div>
    )
  }

  // compact variant — used inside RecomendacaoDia
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: cor.bg,
      borderRadius: 10,
      padding: '10px 14px',
    }}>
      <IconePessoas categoria={categoria} size={22} color={cor.fg} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: cor.fg }}>{rotulo}</span>
          {isEstimate && (
            <span
              title={TOOLTIP}
              style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.4)',
                border: '0.5px solid rgba(255,255,255,0.2)',
                borderRadius: 8,
                padding: '1px 6px',
                cursor: 'help',
                userSelect: 'none',
              }}
            >
              estimativa
            </span>
          )}
        </div>
        <div style={{
          marginTop: 5,
          height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.1)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${nivel}%`,
            background: cor.bar,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>
    </div>
  )
}

// Filled-silhouette people icon. Number of figures scales with the category:
//   baixa → 1, moderada → 2, alta → 3, muito_alta → 4
function IconePessoas({ categoria, size, color }: { categoria: CategoriaOcupacao; size: number; color: string }) {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24', fill: color,
    style: { flexShrink: 0 } as React.CSSProperties,
    'aria-hidden': true,
  }

  if (categoria === 'baixa') {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-1a8 8 0 0 1 16 0v1z" />
      </svg>
    )
  }

  if (categoria === 'moderada') {
    return (
      <svg {...common}>
        <circle cx="8" cy="9" r="3.2" />
        <circle cx="16" cy="9" r="3.2" />
        <path d="M1 21v-1a6 6 0 0 1 12 0v1z" />
        <path d="M11 21v-1a6 6 0 0 1 12 0v1z" />
      </svg>
    )
  }

  if (categoria === 'alta') {
    return (
      <svg {...common}>
        {/* Back two */}
        <circle cx="6" cy="8" r="2.6" />
        <circle cx="18" cy="8" r="2.6" />
        <path d="M0 19v-1a5 5 0 0 1 10 0v1z" />
        <path d="M14 19v-1a5 5 0 0 1 10 0v1z" />
        {/* Front center */}
        <circle cx="12" cy="11" r="3.4" />
        <path d="M5 22v-1a7 7 0 0 1 14 0v1z" />
      </svg>
    )
  }

  // muito_alta
  return (
    <svg {...common}>
      {/* Back row */}
      <circle cx="5" cy="8" r="2.4" />
      <circle cx="12" cy="6.5" r="2.4" />
      <circle cx="19" cy="8" r="2.4" />
      <path d="M-1 19v-1a5 5 0 0 1 10 0v1z" />
      <path d="M7 18v-1a5 5 0 0 1 10 0v1z" />
      <path d="M15 19v-1a5 5 0 0 1 10 0v1z" />
      {/* Front center */}
      <circle cx="12" cy="12" r="3.2" />
      <path d="M5.5 22v-1a6.5 6.5 0 0 1 13 0v1z" />
    </svg>
  )
}
