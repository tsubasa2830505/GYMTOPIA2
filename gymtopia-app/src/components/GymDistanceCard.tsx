'use client';

import { useEffect, useState } from 'react';
import { DatabaseGym } from '@/types/database';
import Link from 'next/link';

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface GymDistanceCardProps {
  gym: DatabaseGym;
  userLocation?: { lat: number; lng: number };
  showDetails?: boolean;
}

export function GymDistanceCard({
  gym,
  userLocation,
  showDetails = true
}: GymDistanceCardProps) {
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (userLocation && gym.latitude && gym.longitude) {
      const dist = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        gym.latitude,
        gym.longitude
      );
      setDistance(dist);
    }
  }, [userLocation, gym]);

  const formatDistance = (dist: number): string => {
    if (dist < 1) {
      return `${Math.round(dist * 1000)}m`;
    }
    return `${dist.toFixed(1)}km`;
  };

  const getDistanceColor = (dist: number): string => {
    if (dist < 1) return 'text-green-600';
    if (dist < 3) return 'text-blue-600';
    if (dist < 5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">
          <Link href={`/gyms/${gym.id}`} className="hover:text-blue-600">
            {gym.name}
          </Link>
        </h3>
        {distance !== null && (
          <span className={`text-sm font-medium ${getDistanceColor(distance)}`}>
            📍 {formatDistance(distance)}
          </span>
        )}
      </div>

      {showDetails && (
        <>
          {gym.address && (
            <p className="text-sm text-gray-600 mb-2">{gym.address}</p>
          )}

          <div className="flex items-center gap-4 text-sm">
            {gym.rating && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span>{gym.rating.toFixed(1)}</span>
                {gym.review_count && (
                  <span className="text-gray-500">({gym.review_count})</span>
                )}
              </div>
            )}

            {gym.users_count > 0 && (
              <div className="flex items-center gap-1 text-gray-600">
                <span>👥</span>
                <span>{gym.users_count}人</span>
              </div>
            )}
          </div>

          {gym.facilities && Array.isArray(gym.facilities) && gym.facilities.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {gym.facilities.slice(0, 3).map((facility: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                >
                  {facility}
                </span>
              ))}
              {gym.facilities.length > 3 && (
                <span className="px-2 py-1 text-xs text-gray-500">
                  +{gym.facilities.length - 3}
                </span>
              )}
            </div>
          )}
        </>
      )}

      {distance !== null && distance < 1 && (
        <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
          🚶 徒歩圏内
        </div>
      )}
    </div>
  );
}