'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DatabaseGym } from '@/types/database';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LeafletMapProps {
  gyms: DatabaseGym[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (gym: DatabaseGym) => void;
  className?: string;
  mapId: string; // Unique ID for each map instance
}

export default function LeafletMap({
  gyms,
  center = { lat: 35.6762, lng: 139.6503 }, // Tokyo
  zoom = 13,
  onMarkerClick,
  className = "w-full h-full",
  mapId
}: LeafletMapProps) {
  useEffect(() => {
    // Check if map already exists
    const container = L.DomUtil.get(mapId);
    if (container && (container as any)._leaflet_id) {
      return; // Map already initialized
    }

    // Initialize map
    const map = L.map(mapId).setView([center.lat, center.lng], zoom);

    // Add OpenStreetMap tiles (free)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add markers for each gym
    const markers: L.Marker[] = [];
    gyms.forEach(gym => {
      if (gym.latitude && gym.longitude) {
        const marker = L.marker([gym.latitude, gym.longitude])
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="font-weight: bold; margin-bottom: 8px;">
                ${gym.name}
              </h3>
              ${gym.address ? `
                <p style="margin: 5px 0; font-size: 14px;">
                  📍 ${gym.address}
                </p>
              ` : ''}
              ${gym.rating ? `
                <p style="margin: 5px 0; font-size: 14px;">
                  ⭐ ${gym.rating}/5
                  ${gym.review_count ? `(${gym.review_count}件)` : ''}
                </p>
              ` : ''}
              <div style="margin-top: 10px;">
                <a href="/gyms/${gym.id}"
                   style="color: var(--gt-secondary); text-decoration: underline;">
                  詳細を見る →
                </a>
              </div>
            </div>
          `);

        marker.on('click', () => {
          if (onMarkerClick) {
            onMarkerClick(gym);
          }
        });

        markers.push(marker);
      }
    });

    // Fit bounds to show all markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    // Cleanup on unmount
    return () => {
      map.remove();
    };
  }, [gyms, center, zoom, onMarkerClick, mapId]);

  return <div id={mapId} className={className} />;
}