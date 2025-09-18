'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';

interface GymLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  equipment?: string[];
}

interface SimpleMapProps {
  gyms?: GymLocation[];
  height?: string;
}

export default function SimpleMap({ 
  gyms = [], 
  height = '600px' 
}: SimpleMapProps) {
  const [selectedGym, setSelectedGym] = useState<GymLocation | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 35.6762, lng: 139.6503 });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          setMapCenter(loc);
        },
        (error) => {
          console.log('位置情報の取得に失敗しました');
        }
      );
    }
  }, []);

  const handleGymSelect = (gym: GymLocation) => {
    setSelectedGym(gym);
    setMapCenter({ lat: gym.lat, lng: gym.lng });
  };

  const getMapUrl = () => {
    const baseUrl = 'https://www.google.com/maps/embed/v1/place';
    const params = new URLSearchParams({
      key: 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8', // 無料の公開デモキー
      q: selectedGym 
        ? `${selectedGym.name},${selectedGym.address}`
        : `${mapCenter.lat},${mapCenter.lng}`,
      zoom: '14',
      center: `${mapCenter.lat},${mapCenter.lng}`
    });
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4" style={{ height }}>
      <div className="flex-1 rounded-lg overflow-hidden shadow-lg">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={getMapUrl()}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="lg:w-96 bg-white rounded-lg shadow-lg p-4 overflow-y-auto">
        <div className="mb-4">
          <h2 className="font-bold text-lg mb-2">ジム一覧</h2>
          {userLocation && (
            <div className="flex items-center gap-2 text-sm text-[color:var(--gt-secondary-strong)] mb-3">
              <Navigation size={16} />
              <span>現在地を取得しました</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {gyms.map((gym) => (
            <div
              key={gym.id}
              className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                selectedGym?.id === gym.id ? 'border-[color:var(--gt-primary)] bg-[rgba(231,103,76,0.08)]' : ''
              }`}
              onClick={() => handleGymSelect(gym)}
            >
              <h3 className="font-semibold">{gym.name}</h3>
              <p className="text-sm text-[color:var(--text-muted)] mt-1 flex items-start gap-1">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                {gym.address}
              </p>
              {gym.equipment && gym.equipment.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {gym.equipment.slice(0, 3).map((eq, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-[rgba(254,255,250,0.95)] px-2 py-1 rounded"
                    >
                      {eq}
                    </span>
                  ))}
                  {gym.equipment.length > 3 && (
                    <span className="text-xs text-[color:var(--text-muted)] px-2 py-1">
                      +{gym.equipment.length - 3}
                    </span>
                  )}
                </div>
              )}
              <button 
                className="mt-2 text-sm text-[color:var(--gt-primary)] hover:text-[color:var(--gt-secondary-strong)] flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${gym.lat},${gym.lng}`,
                    '_blank'
                  );
                }}
              >
                <Navigation size={14} />
                ルート案内
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}