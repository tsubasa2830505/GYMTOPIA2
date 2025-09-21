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
  const userMarkerRef = useRef<any>(null);
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

        // パルスアニメーションとz-indexのCSSを追加
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
          .user-location-marker {
            z-index: 10000 !important;
          }
          .leaflet-marker-icon.user-location-marker {
            z-index: 10000 !important;
          }
          .leaflet-pane.leaflet-marker-pane {
            z-index: 700;
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
    if (!isLoaded || !leaflet || !mapRef.current) return;

    // 既存のマップインスタンスがある場合は削除
    if (mapInstanceRef.current) {
      console.log('🗑️ 既存のマップを削除');
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // マップが既に初期化されている場合はクリア
    if ((mapRef.current as any)._leaflet_id) {
      console.log('⚠️ 既存のLeaflet IDを検出、クリア');
      delete (mapRef.current as any)._leaflet_id;
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

    // ユーザー位置のマーカーは別のuseEffectで管理
    console.log('🗺️ マップ初期化完了');


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
  }, [isLoaded, leaflet]); // マップ初期化のみに依存

  // ユーザー位置マーカーを別途管理
  useEffect(() => {
    if (!mapInstanceRef.current || !leaflet || !userLocation) return;

    console.log('📍 現在地マーカー更新:', userLocation);

    // 既存のユーザーマーカーを削除
    if (userMarkerRef.current) {
      console.log('🗑️ 既存の現在地マーカーを削除');
      mapInstanceRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    // 新しいユーザーマーカーを追加（z-indexを高く設定）
    const userIcon = leaflet.divIcon({
      className: 'user-location-marker',
      html: `<div style="position: relative; z-index: 9999;">
        <div style="
          background-color: #4285F4;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.8);
          z-index: 9999;
          position: relative;
        "></div>
        <div style="
          position: absolute;
          top: -8px;
          left: -8px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 3px solid #4285F4;
          opacity: 0.4;
          animation: pulse 2s infinite;
          z-index: 9998;
        "></div>
      </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    userMarkerRef.current = leaflet.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
      zIndexOffset: 10000,  // マーカー自体のz-indexも高く設定
      className: 'user-location-marker' // クラス名も設定
    })
      .addTo(mapInstanceRef.current)
      .bindPopup('現在地');

    console.log('✅ 現在地マーカー追加完了:', {
      position: [userLocation.lat, userLocation.lng],
      markerExists: !!userMarkerRef.current,
      mapExists: !!mapInstanceRef.current
    });

    // マーカーがマップに追加されているか確認
    let userMarkerFound = false;
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer === userMarkerRef.current) {
        userMarkerFound = true;
      }
    });
    console.log('🔍 マップ内にユーザーマーカーが存在:', userMarkerFound);

    // マップを現在地にパン
    mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 14);
  }, [leaflet, userLocation]); // userLocationの変更を監視

  // ジムマーカーを更新
  useEffect(() => {
    if (!mapInstanceRef.current || !leaflet) return;

    console.log('🏪 ジムマーカー更新開始');
    console.log('🔍 現在のuserMarkerRef:', userMarkerRef.current ? '存在' : 'null');

    // 既存のマーカーをクリア（ユーザーマーカー以外）
    let removedCount = 0;
    mapInstanceRef.current.eachLayer((layer: any) => {
      // ユーザーマーカーの判定を複数の方法で行う
      const isUserMarker =
        layer === userMarkerRef.current || // 参照で判定
        layer.options?.className === 'user-location-marker' || // クラス名で判定
        (layer._icon && layer._icon.className && layer._icon.className.includes('user-location-marker')); // DOM要素で判定

      if (layer instanceof leaflet.Marker && !isUserMarker) {
        console.log('🗑️ ジムマーカー削除:', layer.options);
        mapInstanceRef.current.removeLayer(layer);
        removedCount++;
      } else if (isUserMarker) {
        console.log('✅ ユーザーマーカーを保持:', layer.options);
      }
    });
    console.log(`🏪 ${removedCount}個のジムマーカーを削除`);

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