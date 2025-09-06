'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LatLngExpression, Icon } from 'leaflet';

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

interface GymLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  equipment?: string[];
}

interface MapProps {
  gyms?: GymLocation[];
  showCurrentLocation?: boolean;
  height?: string;
}

export default function Map({ 
  gyms = [], 
  showCurrentLocation = true,
  height = '500px' 
}: MapProps) {
  const [currentPosition, setCurrentPosition] = useState<LatLngExpression | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<any>(null);
  const defaultCenter: LatLngExpression = [35.6762, 139.6503]; // 東京

  useEffect(() => {
    setIsClient(true);
    import('leaflet').then((leaflet) => {
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setL(leaflet);
    });
  }, []);

  useEffect(() => {
    if (showCurrentLocation && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('位置情報の取得に失敗しました:', error);
        }
      );
    }
  }, [showCurrentLocation]);

  if (!isClient) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">マップを読み込み中...</p>
      </div>
    );
  }

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={currentPosition || defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {currentPosition && (
          <Marker position={currentPosition}>
            <Popup>
              <div className="p-2">
                <p className="font-bold">現在地</p>
              </div>
            </Popup>
          </Marker>
        )}

        {gyms.map((gym) => (
          <Marker key={gym.id} position={[gym.lat, gym.lng]}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg">{gym.name}</h3>
                <p className="text-sm text-gray-600">{gym.address}</p>
                {gym.equipment && gym.equipment.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold">設備:</p>
                    <ul className="text-xs">
                      {gym.equipment.slice(0, 3).map((eq, idx) => (
                        <li key={idx}>• {eq}</li>
                      ))}
                      {gym.equipment.length > 3 && (
                        <li className="text-gray-500">他 {gym.equipment.length - 3} 種類</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}