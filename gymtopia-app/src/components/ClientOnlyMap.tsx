'use client';

import { useEffect, useState, useRef } from 'react';
import { DatabaseGym } from '@/types/database';

interface ClientOnlyMapProps {
  gyms: DatabaseGym[];
  selectedGym?: DatabaseGym | null;
  onMarkerClick?: (gym: DatabaseGym) => void;
  userLocation?: { lat: number; lng: number } | null;
}

export function ClientOnlyMap({ gyms, selectedGym, onMarkerClick, userLocation }: ClientOnlyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [leaflet, setLeaflet] = useState<any>(null);

  useEffect(() => {
    // クライアントサイドでのみLeafletを動的にロード
    const loadLeaflet = async () => {
      try {
        if (typeof window === 'undefined') return;

        // Leaflet CSSを動的に追加
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // パルスアニメーションのCSSを追加
        const style = document.createElement('style');
        style.textContent = `
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.8;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          .gym-marker > div {
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .gym-marker:hover > div {
            transform: scale(1.2);
          }
        `;
        document.head.appendChild(style);

        // Leaflet JSを動的にロード
        const L = await import('leaflet');
        setLeaflet(L.default);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
      }
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!isLoaded || !leaflet || !mapRef.current || mapInstanceRef.current) return;

    // マップが既に初期化されている場合はスキップ
    if ((mapRef.current as any)._leaflet_id) {
      return;
    }

    // デフォルトアイコンの修正
    delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
    leaflet.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    // 初期中心座標（東京）
    const initialCenter = userLocation ? [userLocation.lat, userLocation.lng] : [35.6762, 139.6503];

    // マップを初期化
    const mapInstance = leaflet.map(mapRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: true,
      minZoom: 10,
      maxZoom: 18
    });

    // OpenStreetMapタイルレイヤーを追加
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    // ユーザー位置のマーカー
    if (userLocation) {
      const userIcon = leaflet.divIcon({
        className: 'user-location-marker',
        html: `<div style="position: relative;">
          <div style="
            background-color: var(--gt-secondary-strong);
            width: 14px;
            height: 14px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          "></div>
          <div style="
            position: absolute;
            top: -5px;
            left: -5px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid var(--gt-secondary-strong);
            opacity: 0.3;
            animation: pulse 2s infinite;
          "></div>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      leaflet.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapInstance)
        .bindPopup('現在地');
    }


    mapInstanceRef.current = mapInstance;

    // クリーンアップ
    return () => {
      if (mapInstanceRef.current && mapInstanceRef.current.remove) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.error('Error removing map:', error);
        }
      }
      mapInstanceRef.current = null;
    };
  }, [isLoaded, leaflet]); // 依存配列を最小限に

  // ジムマーカーを更新
  useEffect(() => {
    if (!mapInstanceRef.current || !leaflet) return;

    // 既存のマーカーをクリア
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer instanceof leaflet.Marker && layer.options.className !== 'user-location-marker') {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // ジムマーカーを追加
    gyms.forEach(gym => {
      if (!gym.latitude || !gym.longitude) return;

      const isSelected = selectedGym?.id === gym.id;

      // 選択されたジムは異なるアイコンを使用
      const gymIcon = leaflet.divIcon({
        className: 'gym-marker',
        html: `<div style="
          background-color: ${isSelected ? 'var(--gt-primary-strong)' : 'var(--gt-secondary)'};
          width: ${isSelected ? '28px' : '24px'};
          height: ${isSelected ? '28px' : '24px'};
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 3px 12px rgba(0,0,0,0.5);
          ${isSelected ? 'animation: pulse 2s infinite;' : ''}
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-weight: bold;
            font-size: ${isSelected ? '14px' : '12px'};
          ">G</div>
        </div>`,
        iconSize: [isSelected ? 36 : 32, isSelected ? 36 : 32],
        iconAnchor: [isSelected ? 18 : 16, isSelected ? 18 : 16]
      });

      const marker = leaflet.marker([gym.latitude, gym.longitude], { icon: gymIcon })
        .addTo(mapInstanceRef.current);

      // ポップアップの内容
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold;">${gym.name}</h3>
          ${gym.address ? `<p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${gym.address}</p>` : ''}
          ${gym.rating ? `<p style="margin: 0; font-size: 12px;">⭐ ${gym.rating.toFixed(1)}</p>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);

      // クリックイベント
      marker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(gym);
        }
      });
    });
  }, [gyms, selectedGym, onMarkerClick, leaflet]);

  // 選択されたジムが変更された時にマップをパン
  useEffect(() => {
    if (mapInstanceRef.current && selectedGym && selectedGym.latitude && selectedGym.longitude) {
      mapInstanceRef.current.panTo([selectedGym.latitude, selectedGym.longitude]);
    }
  }, [selectedGym]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-[rgba(231,103,76,0.08)] to-[rgba(245,177,143,0.16)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--gt-primary)] mx-auto mb-2"></div>
          <p className="text-sm text-[color:var(--text-muted)]">マップを読み込み中...</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
}