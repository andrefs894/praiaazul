import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { PraiaComMeteo, RecomendacaoResult } from '../types'
import { haversineKm, iconeEstadoTempo } from '../lib/utils'

const PORTUGAL_BOUNDS: L.LatLngBoundsExpression = [[36.3, -10.0], [42.5, -5.8]]

function criarIconePraia(destaque: boolean) {
  if (destaque) {
    return L.divIcon({
      className: '',
      html: `<div class="marker-pulse" style="width:16px;height:16px;background:#3DD9C4;border-radius:50%;border:2px solid rgba(61,217,196,0.3)"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    })
  }
  return L.divIcon({
    className: '',
    html: `<div style="width:8px;height:8px;background:#1A6FB5;border-radius:50%;border:1.5px solid rgba(26,111,181,0.5)"></div>`,
    iconSize: [8, 8],
    iconAnchor: [4, 4],
  })
}

const ICONE_UTILIZADOR = L.divIcon({
  className: '',
  html: '<div style="width:12px;height:12px;background:#E8EDF2;border-radius:50%;border:2px solid rgba(232,237,242,0.4)"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

function VistaAdaptavel({
  coordenadas,
  radiusKm,
}: {
  coordenadas: { lat: number; lng: number } | null
  radiusKm: number
}) {
  const map = useMap()
  useEffect(() => {
    if (!coordenadas) return
    const center = L.latLng(coordenadas.lat, coordenadas.lng)
    const bounds = center.toBounds(radiusKm * 1000 * 2)
    map.fitBounds(bounds, { padding: [20, 20], maxZoom: 14 })
  }, [coordenadas, radiusKm, map])
  return null
}

interface MapaProps {
  praias: PraiaComMeteo[]
  recomendacoes: RecomendacaoResult[]
  coordenadas: { lat: number; lng: number } | null
  radiusKm: number
  onRadiusChange: (km: number) => void
}

export default function Mapa({ praias, recomendacoes, coordenadas, radiusKm, onRadiusChange }: MapaProps) {
  const topId = recomendacoes[0]?.praia.id

  const praiasVisiveis = praias.filter(p => {
    if (p.latitude == null || p.longitude == null) return false
    if (!coordenadas) return true
    return haversineKm(coordenadas.lat, coordenadas.lng, p.latitude, p.longitude) <= radiusKm
  })

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height: 280 }}>
      <MapContainer
        center={[39.5, -8.0]}
        zoom={7}
        minZoom={6}
        maxBounds={PORTUGAL_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <VistaAdaptavel coordenadas={coordenadas} radiusKm={radiusKm} />

        {coordenadas && (
          <Circle
            center={[coordenadas.lat, coordenadas.lng]}
            radius={radiusKm * 1000}
            pathOptions={{
              color: '#1A6FB5',
              fillColor: '#1A6FB5',
              fillOpacity: 0.06,
              weight: 1,
              dashArray: '5, 4',
            }}
          />
        )}

        {praiasVisiveis.map(p => (
          <Marker
            key={p.id}
            position={[p.latitude!, p.longitude!]}
            icon={criarIconePraia(p.id === topId)}
            zIndexOffset={p.id === topId ? 1000 : 0}
          >
            <Popup>
              <strong>{p.nome}</strong>
              {p.concelho && <><br />{p.concelho}</>}
              {p.meteo?.temp_max != null && (
                <><br />{iconeEstadoTempo(p.meteo.estado_tempo, p.meteo.precipitacao)} {p.meteo.temp_max}°C</>
              )}
            </Popup>
          </Marker>
        ))}

        {coordenadas && (
          <Marker position={[coordenadas.lat, coordenadas.lng]} icon={ICONE_UTILIZADOR}>
            <Popup>A tua localização</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Radius toggle — overlaid top-right */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        background: 'white',
        borderRadius: 20,
        border: '0.5px solid #D0DDE8',
        display: 'flex',
        padding: 2,
        gap: 2,
      }}>
        {([10, 50, 100] as const).map(km => (
          <button
            key={km}
            onClick={() => onRadiusChange(km)}
            style={{
              padding: '4px 10px',
              borderRadius: 16,
              border: 'none',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 500,
              background: radiusKm === km ? '#1A6FB5' : 'transparent',
              color: radiusKm === km ? 'white' : '#7A8A9E',
              transition: 'all 0.2s ease',
            }}
          >
            {km} km
          </button>
        ))}
      </div>
    </div>
  )
}
