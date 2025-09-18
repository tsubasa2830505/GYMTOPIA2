'use client';

import { useState } from 'react';
import BaseMap from './BaseMap';
import { GymSearchResult } from '../../types';

export interface GymLocation {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  equipment?: string[];
  rating?: number;
  distance?: number;
}

interface GymMapProps {
  gyms?: GymLocation[];
  selectedGymId?: string;
  onGymSelect?: (gym: GymLocation) => void;
  showCurrentLocation?: boolean;
  height?: string | number;
  className?: string;
}

export default function GymMap({
  gyms = [],
  selectedGymId,
  onGymSelect,
  showCurrentLocation = true,
  height = '500px',
  className = ''
}: GymMapProps) {
  const [hoveredGymId, setHoveredGymId] = useState<string | null>(null);

  // Convert gym data to markers
  const markers = gyms.map(gym => ({
    id: gym.id,
    latitude: gym.latitude,
    longitude: gym.longitude,
    title: gym.name,
    onClick: () => onGymSelect?.(gym),
    popup: (
      <div className="min-w-[200px]">
        <h3 className="font-semibold text-lg mb-2">{gym.name}</h3>
        {gym.address && (
          <p className="text-sm text-[color:var(--text-muted)] mb-2">{gym.address}</p>
        )}
        {gym.rating && (
          <div className="flex items-center mb-2">
            <span className="text-[color:var(--gt-tertiary)]">★</span>
            <span className="ml-1 text-sm">{gym.rating.toFixed(1)}</span>
          </div>
        )}
        {gym.distance && (
          <p className="text-xs text-[color:var(--text-muted)] mb-2">
            約 {gym.distance.toFixed(1)}km
          </p>
        )}
        {gym.equipment && gym.equipment.length > 0 && (
          <div>
            <p className="text-xs text-[color:var(--text-subtle)] mb-1">設備:</p>
            <div className="flex flex-wrap gap-1">
              {gym.equipment.slice(0, 3).map((equipment, index) => (
                <span
                  key={index}
                  className="text-xs bg-[rgba(240,142,111,0.14)] text-[color:var(--gt-secondary-strong)] px-2 py-1 rounded"
                >
                  {equipment}
                </span>
              ))}
              {gym.equipment.length > 3 && (
                <span className="text-xs text-[color:var(--text-muted)]">
                  他{gym.equipment.length - 3}件
                </span>
              )}
            </div>
          </div>
        )}
        <button
          className="mt-2 w-full bg-[color:var(--gt-primary)] text-white text-sm py-1 px-2 rounded hover:bg-[color:var(--gt-primary-strong)] transition-colors"
          onClick={() => onGymSelect?.(gym)}
        >
          詳細を見る
        </button>
      </div>
    )
  }));

  // Calculate center based on gyms if available
  const calculateCenter = (): { latitude: number; longitude: number } | undefined => {
    if (gyms.length === 0) return undefined;

    const avgLat = gyms.reduce((sum, gym) => sum + gym.latitude, 0) / gyms.length;
    const avgLng = gyms.reduce((sum, gym) => sum + gym.longitude, 0) / gyms.length;

    return { latitude: avgLat, longitude: avgLng };
  };

  const center = calculateCenter();

  return (
    <div className={className}>
      <BaseMap
        latitude={center?.latitude}
        longitude={center?.longitude}
        height={height}
        markers={markers}
        showCurrentLocation={showCurrentLocation}
        zoom={13}
      />

      {/* Gym list overlay for mobile */}
      {gyms.length > 0 && (
        <div className="md:hidden absolute bottom-4 left-4 right-4 max-h-32 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg p-2 space-y-2">
            {gyms.slice(0, 3).map((gym) => (
              <div
                key={gym.id}
                className={`p-2 rounded cursor-pointer transition-colors ${
                  selectedGymId === gym.id
                    ? 'bg-[rgba(240,142,111,0.14)] border-l-4 border-[color:var(--gt-primary)]'
                    : 'bg-[rgba(254,255,250,0.97)] hover:bg-[rgba(254,255,250,0.95)]'
                }`}
                onClick={() => onGymSelect?.(gym)}
              >
                <div className="font-medium text-sm">{gym.name}</div>
                {gym.distance && (
                  <div className="text-xs text-[color:var(--text-muted)]">
                    約 {gym.distance.toFixed(1)}km
                  </div>
                )}
              </div>
            ))}
            {gyms.length > 3 && (
              <div className="text-center text-xs text-[color:var(--text-muted)] py-1">
                他{gyms.length - 3}件のジム
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}