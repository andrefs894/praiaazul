import './index.css'
import { Routes, Route, Outlet } from 'react-router-dom'
import NavBar from './components/NavBar'
import FichaPraia from './components/FichaPraia'
import PaginaHoje from './pages/PaginaHoje'
import PaginaExplorar from './pages/PaginaExplorar'
import PaginaFavoritas from './pages/PaginaFavoritas'
import PaginaPerfil from './pages/PaginaPerfil'
import { useLocalizacao } from './hooks/useLocalizacao'
import { usePraiaComMeteo } from './hooks/usePraiaComMeteo'
import type { PraiaComMeteo } from './types'

export interface ContextoApp {
  praiaComMeteo: PraiaComMeteo[]
  loading: boolean
  erro: string | null
  coordenadas: { lat: number; lng: number } | null
}

function Layout() {
  const { coordenadas } = useLocalizacao()
  const { praiaComMeteo, loading, erro } = usePraiaComMeteo(
    coordenadas?.lat ?? null,
    coordenadas?.lng ?? null,
  )

  const ctx: ContextoApp = {
    praiaComMeteo,
    loading,
    erro,
    coordenadas: coordenadas ?? null,
  }

  return (
    <div style={{ background: '#1E3A5F', minHeight: '100vh' }}>
      <Outlet context={ctx} />
      <NavBar />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<PaginaHoje />} />
        <Route path="/explorar" element={<PaginaExplorar />} />
        <Route path="/favoritas" element={<PaginaFavoritas />} />
        <Route path="/perfil" element={<PaginaPerfil />} />
        <Route path="/praia/:id" element={<FichaPraia />} />
      </Route>
    </Routes>
  )
}
