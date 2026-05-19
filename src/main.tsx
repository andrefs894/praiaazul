import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// One-time migration from the legacy "Praia Azul" localStorage keys.
// Safe to remove once all known users have opened the app at least once.
for (const [legado, novo] of [
  ['praia_azul_perfil', 'mare_alta_perfil'],
  ['praia_azul_favoritas', 'mare_alta_favoritas'],
] as const) {
  const valorLegado = localStorage.getItem(legado)
  if (valorLegado !== null && localStorage.getItem(novo) === null) {
    localStorage.setItem(novo, valorLegado)
  }
  if (valorLegado !== null) localStorage.removeItem(legado)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
