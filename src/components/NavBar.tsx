import { Link, useLocation } from 'react-router-dom'

const navy  = '#1E3A5F'
const cream = '#F5EFE0'
const dim   = 'rgba(245,239,224,0.40)'

function IcSol({ cor }: { cor: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.5" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
    </svg>
  )
}

function IcBussola({ cor }: { cor: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={cor} stroke="none" />
    </svg>
  )
}

function IcEstrela({ cor, preenchida }: { cor: string; preenchida: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={preenchida ? cor : 'none'} stroke={cor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function IcPessoa({ cor }: { cor: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="1.8" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

const abas = [
  { path: '/', label: 'Hoje' },
  { path: '/explorar', label: 'Explorar' },
  { path: '/favoritas', label: 'Favoritas' },
  { path: '/perfil', label: 'Perfil' },
]

export default function NavBar() {
  const { pathname } = useLocation()

  function isAtivo(path: string) {
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
  }

  function renderIcon(path: string, ativo: boolean) {
    const cor = ativo ? cream : dim
    if (path === '/')         return <IcSol cor={cor} />
    if (path === '/explorar') return <IcBussola cor={cor} />
    if (path === '/favoritas') return <IcEstrela cor={cor} preenchida={ativo} />
    return <IcPessoa cor={cor} />
  }

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      background: navy,
      borderTop: '1px solid rgba(245,239,224,0.10)',
      paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
      zIndex: 1000,
    }}>
      <div style={{ maxWidth: 420, margin: '0 auto', display: 'flex' }}>
        {abas.map(({ path, label }) => {
          const ativo = isAtivo(path)
          return (
            <Link
              key={path}
              to={path}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                paddingTop: 10,
                paddingBottom: 8,
                textDecoration: 'none',
                color: ativo ? cream : dim,
                fontSize: 10,
                fontWeight: ativo ? 600 : 400,
                letterSpacing: '0.5px',
                position: 'relative',
              }}
            >
              {/* Active indicator — small cream pill at the top */}
              {ativo && (
                <span style={{
                  position: 'absolute',
                  top: 0, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 24, height: 2,
                  borderRadius: 2,
                  background: cream,
                }} />
              )}
              {renderIcon(path, ativo)}
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
