# Google Maps API 統合ガイド

## 📍 必要なGoogle Maps APIサービス

### 1. **Maps JavaScript API**
- インタラクティブな地図表示
- マーカー配置
- 情報ウィンドウ

### 2. **Places API**
- ジムの詳細情報取得
- 周辺施設検索
- 営業時間・レビュー取得

### 3. **Geocoding API**
- 住所から座標への変換
- 逆ジオコーディング（座標から住所）

### 4. **Directions API** (オプション)
- ジムまでのルート案内
- 距離・所要時間計算

## 🗄️ 現在のジムデータ構造

### データベースに保存されている情報
```typescript
interface GymData {
  // 基本情報
  id: string               // UUID
  name: string            // ジム名（例：「ゴールドジム渋谷」）

  // 位置情報 ✅ Google Maps必須
  latitude: number        // 緯度（例：35.65950000）
  longitude: number       // 経度（例：139.70040000）

  // 住所情報
  address: string         // 完全な住所（例：「東京都渋谷区渋谷1-23-16」）
  prefecture: string      // 都道府県（例：「東京都」）
  city: string           // 市区町村（例：「渋谷区」）

  // 連絡先
  phone?: string         // 電話番号
  website?: string       // ウェブサイト

  // 営業情報
  opening_hours?: object // 営業時間（JSON）

  // 施設情報
  facilities?: object    // 設備・サービス
  images?: string[]      // 施設画像URL

  // 評価
  rating?: number        // 平均評価
  review_count?: number  // レビュー数
}
```

## 🔧 Google Maps APIで活用できる機能

### 1. 地図表示
```javascript
// 現在のデータで実装可能
const gymLocation = {
  lat: gym.latitude,  // ✅ データあり
  lng: gym.longitude  // ✅ データあり
};

// マーカー配置
new google.maps.Marker({
  position: gymLocation,
  map: map,
  title: gym.name     // ✅ データあり
});
```

### 2. 情報ウィンドウ
```javascript
// 現在のデータで表示可能な情報
const infoContent = `
  <div>
    <h3>${gym.name}</h3>
    <p>${gym.address}</p>
    <p>評価: ${gym.rating}/5 (${gym.review_count}件)</p>
    ${gym.phone ? `<p>電話: ${gym.phone}</p>` : ''}
    ${gym.website ? `<a href="${gym.website}">ウェブサイト</a>` : ''}
  </div>
`;
```

### 3. 周辺検索機能
```javascript
// ユーザーの現在地から近いジムを検索
const userLocation = await getCurrentLocation();
const nearbyGyms = gyms.filter(gym => {
  const distance = calculateDistance(
    userLocation,
    { lat: gym.latitude, lng: gym.longitude }
  );
  return distance < 5; // 5km以内
});
```

## 📝 Google Maps API追加で取得可能な情報

### Places APIから取得できる追加情報：
- **place_id**: Google固有のID
- **formatted_phone_number**: 国際形式の電話番号
- **international_phone_number**: 国際電話番号
- **opening_hours**: 詳細な営業時間
  - periods: 曜日ごとの営業時間
  - weekday_text: テキスト形式の営業時間
- **photos**: Google Mapsの写真
- **reviews**: Googleレビュー
- **types**: 施設タイプ（gym, health, etc）
- **vicinity**: 簡略化された住所
- **plus_code**: Plus Code
- **business_status**: 営業状態

## 🚀 実装手順

### 1. API キーの取得
```bash
# .env.localに追加
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 2. ライブラリのインストール
```bash
npm install @googlemaps/js-api-loader
npm install @types/google.maps
```

### 3. 地図コンポーネントの作成
```typescript
// src/components/GoogleMap.tsx
import { Loader } from '@googlemaps/js-api-loader';
import { useEffect, useRef, useState } from 'react';
import { DatabaseGym } from '@/types/database';

interface GoogleMapProps {
  gyms: DatabaseGym[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function GoogleMap({ gyms, center, zoom = 14 }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

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
        ]
      });

      setMap(googleMap);
    });
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
        icon: {
          url: '/gym-marker.svg',
          scaledSize: new google.maps.Size(40, 40)
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="font-weight: bold; margin-bottom: 5px;">${gym.name}</h3>
            <p style="margin: 5px 0;">${gym.address || ''}</p>
            ${gym.rating ? `<p style="margin: 5px 0;">評価: ⭐${gym.rating}/5</p>` : ''}
            <a href="/gyms/${gym.id}" style="color: blue; text-decoration: underline;">詳細を見る</a>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      return marker;
    }).filter(Boolean) as google.maps.Marker[];

    setMarkers(newMarkers);
  }, [map, gyms]);

  return <div ref={mapRef} className="w-full h-full" />;
}
```

### 4. ジム検索ページでの実装
```typescript
// src/app/search/page.tsx
import { GoogleMap } from '@/components/GoogleMap';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function SearchPage() {
  const [gyms, setGyms] = useState<DatabaseGym[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyGyms, setNearbyGyms] = useState<DatabaseGym[]>([]);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }

    // Fetch gyms from database
    fetchGyms();
  }, []);

  useEffect(() => {
    if (userLocation && gyms.length > 0) {
      // Calculate nearby gyms (within 5km)
      const filtered = gyms.filter(gym => {
        if (!gym.latitude || !gym.longitude) return false;

        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          gym.latitude,
          gym.longitude
        );

        return distance <= 5; // 5km radius
      });

      setNearbyGyms(filtered);
    }
  }, [userLocation, gyms]);

  const fetchGyms = async () => {
    const { data, error } = await supabase
      .from('gyms')
      .select('*')
      .eq('is_active', true);

    if (!error && data) {
      setGyms(data);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/3 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {userLocation ? '近くのジム' : 'ジム一覧'}
        </h2>
        <div className="space-y-2">
          {(nearbyGyms.length > 0 ? nearbyGyms : gyms).map(gym => (
            <div key={gym.id} className="p-3 border rounded hover:bg-gray-50">
              <h3 className="font-semibold">{gym.name}</h3>
              <p className="text-sm text-gray-600">{gym.address}</p>
              {gym.rating && (
                <p className="text-sm">評価: ⭐{gym.rating}/5</p>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="w-2/3">
        <GoogleMap
          gyms={nearbyGyms.length > 0 ? nearbyGyms : gyms}
          center={userLocation || undefined}
          zoom={userLocation ? 14 : 11}
        />
      </div>
    </div>
  );
}
```

## 💡 推奨される追加機能

### 1. 現在地からの距離表示
```typescript
// src/components/GymCard.tsx
interface GymCardProps {
  gym: DatabaseGym;
  userLocation?: { lat: number; lng: number };
}

export function GymCard({ gym, userLocation }: GymCardProps) {
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

  return (
    <div className="p-4 border rounded">
      <h3>{gym.name}</h3>
      {distance !== null && (
        <p className="text-sm text-gray-600">
          📍 {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
        </p>
      )}
    </div>
  );
}
```

### 2. ルート案内
```typescript
// Directions APIを使用したルート表示
const directionsService = new google.maps.DirectionsService();
const directionsRenderer = new google.maps.DirectionsRenderer();

directionsRenderer.setMap(map);

const calculateRoute = async (origin: google.maps.LatLng, destination: google.maps.LatLng) => {
  const request = {
    origin,
    destination,
    travelMode: google.maps.TravelMode.TRANSIT, // 公共交通機関
    transitOptions: {
      modes: [google.maps.TransitMode.TRAIN, google.maps.TransitMode.BUS],
      routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
    }
  };

  directionsService.route(request, (result, status) => {
    if (status === 'OK') {
      directionsRenderer.setDirections(result);
    }
  });
};
```

### 3. ストリートビュー
```typescript
// Street View Panoramaの実装
const panorama = new google.maps.StreetViewPanorama(
  document.getElementById('street-view'),
  {
    position: { lat: gym.latitude, lng: gym.longitude },
    pov: { heading: 165, pitch: 0 },
    zoom: 1
  }
);
```

### 4. ヒートマップ
```typescript
// ジム密集度のヒートマップ
import { HeatmapLayer } from '@googlemaps/js-api-loader';

const heatmapData = gyms.map(gym => ({
  location: new google.maps.LatLng(gym.latitude, gym.longitude),
  weight: gym.users_count || 1
}));

const heatmap = new google.maps.visualization.HeatmapLayer({
  data: heatmapData,
  map: map,
  radius: 20
});
```

## ⚠️ 注意事項

### データの整合性
- 一部のprefectureフィールドに不正なデータあり（「県」が重複）
- 座標は文字列として保存されているため、数値変換が必要

### APIクォータ
- Maps JavaScript API: 月額$200無料枠
- Places API: リクエストごとに課金
- Geocoding API: 月額$200無料枠

### セキュリティ
- APIキーの制限設定
- HTTPリファラー制限
- APIキーの環境変数管理

## 📊 現在のデータ状況

### 利用可能なデータ
- ✅ **座標データ**: 全ジムに存在（latitude, longitude）
- ✅ **住所データ**: 全ジムに存在（address, prefecture, city）
- ✅ **基本情報**: 名前、エリア、説明
- ✅ **評価**: rating, review_count
- ✅ **利用者数**: users_count

### Places APIで補完すべきデータ
- ⚠️ **電話番号**: 現在null → Places APIから取得
- ⚠️ **ウェブサイト**: 現在null → Places APIから取得
- ⚠️ **営業時間**: 一部のみ → Places APIから取得
- ⚠️ **写真**: image_urlsフィールドはあるが空 → Places APIから取得

### データ補完の実装例
```typescript
// src/lib/google-maps/places-enrichment.ts
import { DatabaseGym } from '@/types/database';

export async function enrichGymDataWithPlaces(
  gym: DatabaseGym,
  placesService: google.maps.places.PlacesService
): Promise<Partial<DatabaseGym>> {
  return new Promise((resolve, reject) => {
    // まず近くの場所を検索
    const request = {
      location: new google.maps.LatLng(gym.latitude!, gym.longitude!),
      radius: 50, // 50m以内
      type: 'gym',
      keyword: gym.name
    };

    placesService.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results?.[0]) {
        const place = results[0];

        // 詳細情報を取得
        const detailRequest = {
          placeId: place.place_id!,
          fields: [
            'formatted_phone_number',
            'international_phone_number',
            'website',
            'opening_hours',
            'photos',
            'reviews',
            'rating',
            'user_ratings_total'
          ]
        };

        placesService.getDetails(detailRequest, (placeDetails, detailStatus) => {
          if (detailStatus === google.maps.places.PlacesServiceStatus.OK && placeDetails) {
            resolve({
              phone: placeDetails.formatted_phone_number || undefined,
              website: placeDetails.website || undefined,
              opening_hours: placeDetails.opening_hours?.weekday_text ?
                { weekday_text: placeDetails.opening_hours.weekday_text } : undefined,
              rating: placeDetails.rating || undefined,
              review_count: placeDetails.user_ratings_total || undefined,
              image_urls: placeDetails.photos?.slice(0, 5).map(photo =>
                photo.getUrl({ maxWidth: 800 })
              ) || undefined
            });
          } else {
            resolve({});
          }
        });
      } else {
        resolve({});
      }
    });
  });
}

// Supabaseへの更新
export async function updateGymWithPlacesData(
  gymId: string,
  enrichedData: Partial<DatabaseGym>
) {
  const { error } = await supabase
    .from('gyms')
    .update(enrichedData)
    .eq('id', gymId);

  if (error) {
    console.error('Failed to update gym:', error);
  }
}
```

Google Maps APIの統合により、より豊富な情報と機能を提供できます！