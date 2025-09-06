'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface GymLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  equipment?: string[];
}

interface StaticMapProps {
  gyms?: GymLocation[];
  height?: string;
}

export default function StaticMap({ 
  gyms = [], 
  height = '600px' 
}: StaticMapProps) {
  const [selectedGym, setSelectedGym] = useState<GymLocation | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 35.6762, lng: 139.6503 });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [zoom, setZoom] = useState(13);

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

  // OpenStreetMap静的画像を生成
  const getStaticMapUrl = () => {
    const width = 800;
    const height = 600;
    
    // マーカーを追加
    let markers = '';
    if (selectedGym) {
      markers = `&markers=${selectedGym.lat},${selectedGym.lng},red`;
    } else if (userLocation) {
      markers = `&markers=${userLocation.lat},${userLocation.lng},blue`;
    }
    
    // OpenStreetMapタイルサーバーを使用
    return `https://static-maps.yandex.ru/1.x/?lang=ja_JP&ll=${mapCenter.lng},${mapCenter.lat}&z=${zoom}&l=map&size=${width},${height}${markers}`;
  };

  // またはMapbox Static APIを使用（無料枠あり）
  const getMapboxStaticUrl = () => {
    const width = 800;
    const height = 600;
    let pins = '';
    
    if (selectedGym) {
      pins = `pin-l+ff0000(${selectedGym.lng},${selectedGym.lat})/`;
    } else if (userLocation) {
      pins = `pin-l+0000ff(${userLocation.lng},${userLocation.lat})/`;
    }
    
    // 実際には無料のOSMタイルを使用
    return `https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng-0.02},${mapCenter.lat-0.02},${mapCenter.lng+0.02},${mapCenter.lat+0.02}&layer=mapnik&marker=${mapCenter.lat},${mapCenter.lng}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4" style={{ height }}>
      <div className="flex-1 rounded-lg overflow-hidden shadow-lg bg-gray-100">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={getMapboxStaticUrl()}
          style={{ border: 0 }}
        />
        
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
          <button 
            onClick={() => setZoom(Math.min(zoom + 1, 18))}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            +
          </button>
          <button 
            onClick={() => setZoom(Math.max(zoom - 1, 5))}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            -
          </button>
        </div>
      </div>

      <div className="lg:w-96 bg-white rounded-lg shadow-lg p-4 overflow-y-auto">
        <div className="mb-4">
          <h2 className="font-bold text-lg mb-2">ジム一覧</h2>
          {userLocation && (
            <div className="flex items-center gap-2 text-sm text-green-600 mb-3">
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
                selectedGym?.id === gym.id ? 'border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleGymSelect(gym)}
            >
              <h3 className="font-semibold">{gym.name}</h3>
              <p className="text-sm text-gray-600 mt-1 flex items-start gap-1">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                {gym.address}
              </p>
              {gym.equipment && gym.equipment.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {gym.equipment.slice(0, 3).map((eq, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      {eq}
                    </span>
                  ))}
                  {gym.equipment.length > 3 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{gym.equipment.length - 3}
                    </span>
                  )}
                </div>
              )}
              <button 
                className="mt-2 text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gym.name + ' ' + gym.address)}`,
                    '_blank'
                  );
                }}
              >
                <Navigation size={14} />
                Google Mapsで開く
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}