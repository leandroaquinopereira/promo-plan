/* eslint-disable @next/next/no-img-element */
'use client'

import { Loader } from '@googlemaps/js-api-loader'
import { env } from '@promo/env'
import {
  type RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useTransition,
} from 'react'

import { Skeleton } from './ui/skeleton'

export enum GoogleMapMode {
  INTERACTIVE = 'interactive',
  STATIC_READ_ONLY = 'static-read-only',
}

export type GoogleMapMethods = {
  getMap: () => google.maps.Map | null
  getStaticMapUrl: () => string | null
  getMapSize: () => {
    width: number
    height: number
  }
}

type GoogleMapProps = Omit<google.maps.MapOptions, 'center' | 'zoom'> & {
  initialPosition?: {
    lat: number
    lng: number
  }
  initialZoom?: number
  mode?: GoogleMapMode
  ref?: RefObject<GoogleMapMethods | null>
}

const DEFAULT_MAP_SIZE = {
  width: 600,
  height: 300,
}

export function GoogleMap({
  initialPosition,
  initialZoom,
  mode = GoogleMapMode.INTERACTIVE,
  ref,
  ...props
}: GoogleMapProps) {
  const googleMapContainerRef = useRef<HTMLDivElement | null>(null)
  const [staticMapUrl, setStaticMapUrl] = useState<string | null>(null)
  const [isStaticMapLoading, startStaticMapLoadingTransition] = useTransition()

  const mapRef = useRef<google.maps.Map | null>(null)

  const handleGetStaticMapUrl = useCallback(
    async function handleGetStaticMapUrl() {
      startStaticMapLoadingTransition(async () => {
        const initialPositionString = `${initialPosition?.lat ?? 0},${initialPosition?.lng ?? 0}`
        const markerString = `color:red|${initialPositionString}`
        const sizeString = `${DEFAULT_MAP_SIZE.width}x${DEFAULT_MAP_SIZE.height}`

        const staticUrlMap = `https://maps.googleapis.com/maps/api/staticmap?center=${initialPositionString}&zoom=${initialZoom}&size=${sizeString}&markers=${markerString}&key=${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`

        const response = await fetch(staticUrlMap)
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onloadend = () => {
          const dataUrl = reader.result as string
          setStaticMapUrl(dataUrl)
        }

        reader.readAsDataURL(blob)
      })
    },
    [initialPosition, initialZoom],
  )

  useImperativeHandle<unknown, GoogleMapMethods>(ref, () => ({
    getMap: () => {
      return mapRef.current
    },
    getStaticMapUrl: () => {
      return staticMapUrl
    },
    getMapSize: () => {
      return DEFAULT_MAP_SIZE
    },
  }))

  useEffect(() => {
    async function initializeGoogleMap() {
      if (!googleMapContainerRef.current) {
        return
      }

      const loader = new Loader({
        apiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['visualization', 'maps', 'marker', 'places'],
      })

      const maps = await loader.importLibrary('maps')
      const marker = (await loader.importLibrary(
        'marker',
      )) as google.maps.MarkerLibrary

      const center = initialPosition ?? {
        lat: 0,
        lng: 0,
      }

      const map = new maps.Map(googleMapContainerRef.current, {
        center,
        zoom: initialZoom ?? 16,
        mapId: 'google-map',
        clickableIcons: false,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
        gestureHandling: 'greedy',
        keyboardShortcuts: false,
        ...props,
      })

      new marker.AdvancedMarkerElement({
        position: center,
        map,
      })

      mapRef.current = map
    }

    if (mode === GoogleMapMode.INTERACTIVE) {
      initializeGoogleMap()
    }
  }, [initialPosition, initialZoom, mode, props])

  useEffect(() => {
    if (mode === GoogleMapMode.STATIC_READ_ONLY) {
      handleGetStaticMapUrl()
    }
  }, [mode, handleGetStaticMapUrl])

  if (mode === GoogleMapMode.STATIC_READ_ONLY) {
    return (
      <div ref={googleMapContainerRef} className="size-full">
        {isStaticMapLoading && (
          <Skeleton className="size-full bg-accent-foreground rounded-none rounded-bl-lg" />
        )}

        {staticMapUrl && !isStaticMapLoading && (
          <img
            src={staticMapUrl}
            alt="Current location of the user"
            className="size-full object-cover"
          />
        )}
      </div>
    )
  }

  return <div ref={googleMapContainerRef} className="size-full"></div>
}
