import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { DatabaseGym } from '@/types/database';

interface GoogleMapProps {
  gyms: DatabaseGym[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (gym: DatabaseGym) => void;
  className?: string;
}

export function GoogleMap({
  gyms,
  center,
  zoom = 14,
  onMarkerClick,
  className = "w-full h-full"
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: "weekly",
      libraries: ["places", "geometry"]
    });

    loader.load().then(() => {
      if (!mapRef.current) return;

      const googleMap = new google.maps.Map(mapRef.current, {
        center: center || { lat: 35.6762, lng: 139.6503 }, // Tokyo
        zoom,
        styles: [
          {
            featureType: "poi.business",
            stylers: [{ visibility: "off" }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true
      });

      setMap(googleMap);

      // Initialize info window
      infoWindowRef.current = new google.maps.InfoWindow();
    });

    return () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Add new markers
    const newMarkers = gyms.map(gym => {
      if (!gym.latitude || !gym.longitude) return null;

      const marker = new google.maps.Marker({
        position: {
          lat: gym.latitude,
          lng: gym.longitude
        },
        map,
        title: gym.name,
        animation: google.maps.Animation.DROP
      });

      // Add click listener to marker
      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          const content = `
            <div style="padding: 10px; min-width: 200px;">
              <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">
                ${gym.name}
              </h3>
              ${gym.address ? `
                <p style="margin: 5px 0; font-size: 14px; color: #666;">
                  📍 ${gym.address}
                </p>
              ` : ''}
              ${gym.rating ? `
                <p style="margin: 5px 0; font-size: 14px;">
                  ⭐ ${gym.rating}/5
                  ${gym.review_count ? `(${gym.review_count}件のレビュー)` : ''}
                </p>
              ` : ''}
              ${gym.users_count ? `
                <p style="margin: 5px 0; font-size: 14px;">
                  👥 ${gym.users_count}人が利用中
                </p>
              ` : ''}
              <div style="margin-top: 10px;">
                <a href="/gyms/${gym.id}"
                   style="color: var(--gt-secondary); text-decoration: underline; font-size: 14px;">
                  詳細を見る →
                </a>
              </div>
            </div>
          `;

          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(map, marker);
        }

        if (onMarkerClick) {
          onMarkerClick(gym);
        }
      });

      return marker;
    }).filter(Boolean) as google.maps.Marker[];

    setMarkers(newMarkers);

    // Adjust map bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition()!);
      });
      map.fitBounds(bounds);

      // Prevent excessive zoom
      const listener = google.maps.event.addListenerOnce(map, 'idle', () => {
        if ((map.getZoom() || 0) > 16) {
          map.setZoom(16);
        }
      });
    }
  }, [map, gyms, onMarkerClick]);

  return <div ref={mapRef} className={className} />;
}