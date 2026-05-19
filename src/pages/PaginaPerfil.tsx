import Header from '../components/Header'
import { usePerfil } from '../hooks/usePerfil'
import { useLocalizacao } from '../hooks/useLocalizacao'
import { useAuth } from '../hooks/useAuth'
import type { TipoPerfil, DistanciaMaxima } from '../types'

const C = {
  navy: '#1E3A5F',
  cream: '#EDE3CD',
  white: '#FFFFFF',
  navyDim: 'rgba(30,58,95,0.55)',
  navySoft: 'rgba(30,58,95,0.08)',
  pillBorder: 'rgba(30,58,95,0.25)',
} as const


const LABEL_ST: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: C.navyDim,
  letterSpacing: '2.5px', textTransform: 'uppercase', margin: '0 0 14px',
}

const TIPOS: { valor: TipoPerfil; label: string }[] = [
  { valor: 'familia', label: 'Família' },
  { valor: 'tranquila', label: 'Sossego' },
  { valor: 'surf', label: 'Surf' },
  { valor: 'social', label: 'Social' },
]

const DISTANCIAS: { valor: DistanciaMaxima; label: string }[] = [
  { valor: 25,  label: '25 km' },
  { valor: 50,  label: '50 km' },
  { valor: 100, label: '100 km' },
  { valor: 200, label: '200 km' },
]

function ChipSeletor({
  label,
  ativo,
  onClick,
}: {
  label: string
  ativo: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 14px',
        borderRadius: 20,
        border: `1px solid ${C.pillBorder}`,
        background: ativo ? C.navy : 'transparent',
        color: ativo ? C.cream : C.navy,
        fontSize: 13, fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.18s ease',
      }}
    >
      {label}
    </button>
  )
}

export default function PaginaPerfil() {
  const { perfil, atualizar } = usePerfil()
  const { coordenadas, erro: erroLoc } = useLocalizacao()
  const { user, signInWithGoogle, signOut } = useAuth()

  const nome = user?.user_metadata?.full_name as string | undefined
  const email = user?.email
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  const cardStyle: React.CSSProperties = {
    background: C.white,
    borderRadius: 16,
    padding: 18,
    boxShadow: '0 1px 3px rgba(30,58,95,0.06)',
  }

  return (
    <div style={{ background: C.navy, minHeight: '100vh' }}>
      <div style={{ maxWidth: 420, margin: '0 auto', background: C.cream, minHeight: '100vh', position: 'relative', paddingBottom: 90 }}>
        <Header />

        <div style={{ padding: '24px 20px 4px' }}>
          <h1 style={{
            fontSize: 34, fontWeight: 500,
            color: C.navy, margin: 0, letterSpacing: '-0.5px', lineHeight: 1,
          }}>
            Perfil
          </h1>
          <p style={{ fontSize: 13, color: C.navyDim, margin: '8px 0 0' }}>
            As tuas preferências para a recomendação de hoje.
          </p>
        </div>

        <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Account */}
          <div style={cardStyle}>
            <p style={LABEL_ST}>Conta</p>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: C.navy, color: C.cream,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 500, flexShrink: 0,
                  }}>
                    {(nome ?? email ?? '?').slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {nome && (
                    <p style={{
                      fontSize: 14, fontWeight: 500, color: C.navy, margin: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {nome}
                    </p>
                  )}
                  {email && (
                    <p style={{
                      fontSize: 12, color: C.navyDim, margin: nome ? '2px 0 0' : 0,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {email}
                    </p>
                  )}
                </div>
                <button
                  onClick={signOut}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${C.pillBorder}`,
                    color: C.navy,
                    borderRadius: 20,
                    padding: '6px 14px',
                    fontSize: 12, fontWeight: 500,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  Sair
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: C.navyDim, margin: '0 0 14px', lineHeight: 1.5 }}>
                  Inicia sessão para sincronizar as tuas praias favoritas em todos os dispositivos.
                </p>
                <button
                  onClick={signInWithGoogle}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '12px 14px',
                    background: C.white,
                    color: '#1F1F1F',
                    border: `1px solid ${C.pillBorder}`,
                    borderRadius: 22,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/>
                  </svg>
                  Entrar com Google
                </button>
              </div>
            )}
          </div>

          {/* What are you looking for */}
          <div style={cardStyle}>
            <p style={LABEL_ST}>O que procuras?</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TIPOS.map(({ valor, label }) => (
                <ChipSeletor
                  key={valor}
                  label={label}
                  ativo={perfil.tipo === valor}
                  onClick={() => atualizar({ tipo: valor })}
                />
              ))}
            </div>
          </div>

          {/* Max distance */}
          <div style={cardStyle}>
            <p style={LABEL_ST}>Distância máxima</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DISTANCIAS.map(({ valor, label }) => (
                <ChipSeletor
                  key={String(valor)}
                  label={label}
                  ativo={perfil.distancia_maxima === valor}
                  onClick={() => atualizar({ distancia_maxima: valor })}
                />
              ))}
            </div>
          </div>

          {/* Location */}
          <div style={cardStyle}>
            <p style={LABEL_ST}>Localização</p>
            {coordenadas ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#3DA66E', flexShrink: 0,
                }} />
                <div>
                  <p style={{ fontSize: 14, color: C.navy, margin: 0, fontWeight: 500 }}>Localização detectada</p>
                  <p style={{ fontSize: 12, color: C.navyDim, margin: '2px 0 0' }}>
                    {coordenadas.lat.toFixed(4)}°N, {Math.abs(coordenadas.lng).toFixed(4)}°W
                  </p>
                </div>
              </div>
            ) : erroLoc ? (
              <div>
                <p style={{ fontSize: 14, color: C.navy, margin: '0 0 6px', fontWeight: 500 }}>Localização não disponível</p>
                <p style={{ fontSize: 12, color: C.navyDim, margin: 0, lineHeight: 1.5 }}>
                  Permite o acesso à localização no browser para ver distâncias e recomendações por raio.
                </p>
              </div>
            ) : (
              <p style={{ fontSize: 14, color: C.navyDim, margin: 0 }}>A detectar localização…</p>
            )}
          </div>

          {/* App info */}
          <div style={cardStyle}>
            <p style={LABEL_ST}>Sobre</p>
            <p style={{ fontSize: 13, color: C.navyDim, margin: 0, lineHeight: 1.6 }}>
              Maré Alta recomenda a melhor praia para ti com base no tempo, vento, distância e o teu perfil.
              Dados meteorológicos: IPMA. Dados de praias: APA/SNIAmb.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
