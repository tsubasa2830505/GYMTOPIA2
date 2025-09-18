'use client';

import { useState, useEffect, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { LatLngExpression, Icon } from 'leaflet';

// Dynamic imports for React Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
// Import useMapEvents differently for dynamic loading
let useMapEventsHook: any;

export interface BaseMapProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  height?: string | number;
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    onClick?: () => void;
    popup?: ReactNode;
  }>;
  onMapClick?: (lat: number, lng: number) => void;
  interactive?: boolean;
  showCurrentLocation?: boolean;
  className?: string;
  children?: ReactNode;
}

const DEFAULT_CENTER: LatLngExpression = [35.6762, 139.6503]; // Tokyo
const DEFAULT_ZOOM = 13;

export default function BaseMap({
  latitude,
  longitude,
  zoom = DEFAULT_ZOOM,
  height = '500px',
  markers = [],
  onMapClick,
  interactive = true,
  showCurrentLocation = true,
  className = '',
  children
}: BaseMapProps) {
  const [currentPosition, setCurrentPosition] = useState<LatLngExpression | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Determine map center
  const mapCenter: LatLngExpression = latitude && longitude
    ? [latitude, longitude]
    : currentPosition || DEFAULT_CENTER;

  useEffect(() => {
    setIsClient(true);
    // Load useMapEvents hook dynamically
    if (typeof window !== 'undefined') {
      import('react-leaflet').then((mod) => {
        useMapEventsHook = mod.useMapEvents;
      });
    }
  }, []);

  useEffect(() => {
    if (showCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos: LatLngExpression = [
            position.coords.latitude,
            position.coords.longitude
          ];
          setCurrentPosition(pos);
        },
        (error) => {
          console.warn('位置情報の取得に失敗しました:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }
  }, [showCurrentLocation]);

  if (!isClient) {
    return (
      <div
        className={`bg-[rgba(254,255,250,0.9)] rounded-lg flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-[color:var(--text-muted)]">マップを読み込み中...</div>
      </div>
    );
  }

  // Map click handler component
  const MapClickHandler = () => {
    if (!useMapEventsHook) return null;

    try {
      useMapEventsHook({
        click: (e: any) => {
          if (onMapClick && interactive) {
            const { lat, lng } = e.latlng;
            onMapClick(lat, lng);
          }
        }
      });
    } catch (error) {
      console.warn('Map click handler error:', error);
    }
    return null;
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
        zoomControl={interactive}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map click handler - temporarily disabled for type safety */}
        {/* {onMapClick && <MapClickHandler />} */}

        {/* Current location marker */}
        {showCurrentLocation && currentPosition && (
          <Marker
            position={currentPosition}
            icon={new Icon({
              iconUrl: '/icons/current-location.png',
              iconSize: [25, 25],
              iconAnchor: [12, 12],
              popupAnchor: [0, -12]
            })}
          >
            <Popup>現在地</Popup>
          </Marker>
        )}

        {/* Custom markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            eventHandlers={{
              click: marker.onClick
            }}
          >
            {(marker.title || marker.description || marker.popup) && (
              <Popup>
                {marker.popup || (
                  <div>
                    {marker.title && (
                      <h3 className="font-semibold text-lg">{marker.title}</h3>
                    )}
                    {marker.description && (
                      <p className="text-sm text-[color:var(--text-muted)]">{marker.description}</p>
                    )}
                  </div>
                )}
              </Popup>
            )}
          </Marker>
        ))}

        {children}
      </MapContainer>

      {/* Loading overlay */}
      {!mapReady && (
        <div className="absolute inset-0 bg-[rgba(254,255,250,0.9)] flex items-center justify-center rounded-lg">
          <div className="text-[color:var(--text-muted)]">マップを初期化中...</div>
        </div>
      )}
    </div>
  );
}