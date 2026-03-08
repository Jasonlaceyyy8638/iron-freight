'use client'

import { useEffect, useMemo } from 'react'
import Map, { Source, Layer, Marker, useMap } from 'react-map-gl/mapbox'
import circle from '@turf/circle'

const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v11'

export type GeofenceCircle = {
  lat: number
  lng: number
  radiusMeters: number
  label?: string
}

export type GeofenceMarker = {
  lat: number
  lng: number
  label?: string
  color?: string
}

type GeofenceMapProps = {
  center: [number, number]
  zoom?: number
  circles?: GeofenceCircle[]
  markers?: GeofenceMarker[]
  height?: string
  className?: string
}

function FitBounds({ circles, markers }: { circles?: GeofenceCircle[]; markers?: GeofenceMarker[] }) {
  const { current: mapRef } = useMap()
  useEffect(() => {
    const mapInstance = mapRef?.getMap?.()
    if (!mapInstance) return
    const points: [number, number][] = []
    circles?.forEach((c) => points.push([c.lng, c.lat]))
    markers?.forEach((m) => points.push([m.lng, m.lat]))
    if (points.length > 1) {
      const bounds = points.reduce(
        (acc, [lng, lat]) => {
          acc[0] = Math.min(acc[0], lng)
          acc[1] = Math.min(acc[1], lat)
          acc[2] = Math.max(acc[2], lng)
          acc[3] = Math.max(acc[3], lat)
          return acc
        },
        [Infinity, Infinity, -Infinity, -Infinity]
      )
      mapInstance.fitBounds(bounds as [number, number, number, number], { padding: 24, maxZoom: 15 })
    }
  }, [mapRef, circles, markers])
  return null
}

export function GeofenceMap({
  center,
  zoom = 14,
  circles = [],
  markers = [],
  height = '240px',
  className = '',
}: GeofenceMapProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  const circleSources = useMemo(() => {
    return circles.map((c, i) => {
      const centerGeo: [number, number] = [c.lng, c.lat]
      const radiusKm = c.radiusMeters / 1000
      const poly = circle(centerGeo, radiusKm, { units: 'kilometers', steps: 64 })
      return { id: `geofence-circle-${i}`, data: poly }
    })
  }, [circles])

  if (!token) {
    return (
      <div
        className={`flex items-center justify-center rounded border border-divider bg-surface text-[#A3A3A3] ${className}`}
        style={{ height }}
      >
        <div className="text-center text-sm">
          <p>Map requires Mapbox token.</p>
          <p className="mt-1 text-xs">Set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in .env.local, then restart the dev server.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded border border-divider bg-surface ${className}`} style={{ height }}>
      <Map
        mapboxAccessToken={token}
        initialViewState={{
          latitude: center[0],
          longitude: center[1],
          zoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAPBOX_STYLE}
      >
        {circleSources.map(({ id, data }) => (
          <Source key={id} id={id} type="geojson" data={data}>
            <Layer
              id={`${id}-fill`}
              type="fill"
              paint={{
                'fill-color': '#C1FF00',
                'fill-opacity': 0.15,
              }}
            />
            <Layer
              id={`${id}-line`}
              type="line"
              paint={{
                'line-color': '#C1FF00',
                'line-width': 2,
              }}
            />
          </Source>
        ))}
        {markers.map((m, i) => (
          <Marker key={i} longitude={m.lng} latitude={m.lat} anchor="center">
            <div
              className="h-3 w-3 rounded-full border-2 border-white shadow"
              style={{ backgroundColor: m.color ?? '#C1FF00' }}
              title={m.label}
            />
          </Marker>
        ))}
        {circles.length + markers.length > 1 && <FitBounds circles={circles} markers={markers} />}
      </Map>
    </div>
  )
}
