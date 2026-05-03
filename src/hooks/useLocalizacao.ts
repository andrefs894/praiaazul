import { useEffect, useState } from 'react'

interface Coordenadas {
  lat: number
  lng: number
}

// Requests the browser's Geolocation API.
// Returns null while pending, the position on success, or an error string on failure.
export function useLocalizacao() {
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setErro('Geolocalização não suportada neste dispositivo.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordenadas({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLoading(false)
      },
      (err) => {
        setErro(err.message)
        setLoading(false)
      }
    )
  }, [])

  return { coordenadas, loading, erro }
}
