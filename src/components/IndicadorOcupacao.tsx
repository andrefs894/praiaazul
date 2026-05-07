// Visual indicator for beach occupation (0–100 busyness level).
// Renders a colored pill with category label and a thin progress bar.
// Two layouts:
//   - "compact": single row pill — fits inside RecomendacaoDia next to weather.
//   - "card":    full-width block — used as a section in FichaPraia.

import { categorizar, rotuloOcupacao, corOcupacao } from '../lib/ocupacao'
import type { FonteOcupacao } from '../lib/ocupacao'

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
        background: '#132A3A',
        borderRadius: 12,
        padding: 16,
      }}>
        <p style={{
          fontSize: 10, fontWeight: 500, color: '#7A8A9E',
          letterSpacing: '2px', textTransform: 'uppercase',
          margin: '0 0 12px',
        }}>
          Lotação prevista
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 22 }}>👥</span>
          <span style={{ fontSize: 18, fontWeight: 500, color: cor.fg, flex: 1 }}>{rotulo}</span>
          <span style={{ fontSize: 12, color: '#7A8A9E' }}>{nivel}/100</span>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 6, borderRadius: 3,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${nivel}%`,
            background: cor.bar,
            transition: 'width 0.3s ease',
          }} />
        </div>

        <p style={{ fontSize: 11, color: '#7A8A9E', margin: '12px 0 0', lineHeight: 1.5 }}>
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
      <span style={{ fontSize: 18, flexShrink: 0 }}>👥</span>
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
