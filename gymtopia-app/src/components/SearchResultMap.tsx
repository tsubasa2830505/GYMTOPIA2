'use client';

import React, { useState } from 'react';
import { MapPin, ExternalLink, X } from 'lucide-react';

interface Gym {
  id: number | string;
  name: string;
  location: string;
  distance: string;
  likes: number;
  tags: string[];
  isLiked: boolean;
  price?: string;
  address?: string;
  lat?: number;
  lng?: number;
}

interface SearchResultMapProps {
  gyms: Gym[];
  onGymSelect: (gymId: string | number) => void;
  height?: string;
}

// 東京エリアのサンプル座標
const SAMPLE_LOCATIONS: { [key: string]: { lat: number; lng: number } } = {
  '銀座': { lat: 35.6718, lng: 139.7640 },
  '渋谷': { lat: 35.6595, lng: 139.7004 },
  '新宿': { lat: 35.6896, lng: 139.6995 },
  '池袋': { lat: 35.7295, lng: 139.7109 },
  '恵比寿': { lat: 35.6462, lng: 139.7196 },
  '原宿': { lat: 35.6707, lng: 139.7024 },
  '六本木': { lat: 35.6641, lng: 139.7294 },
  '品川': { lat: 35.6284, lng: 139.7387 },
  '目黒': { lat: 35.6336, lng: 139.7159 },
  '中目黒': { lat: 35.6443, lng: 139.6979 },
  '代官山': { lat: 35.6503, lng: 139.6986 },
  '青山': { lat: 35.6691, lng: 139.7272 },
};

export default function SearchResultMap({ 
  gyms, 
  onGymSelect,
  height = '400px' 
}: SearchResultMapProps) {
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);

  // ジムに座標を追加
  const gymsWithCoords = gyms.map((gym, index) => {
    if (gym.lat && gym.lng) {
      return gym;
    }
    
    // ロケーションからサンプル座標を取得、なければ東京駅周辺にランダム配置
    const coords = SAMPLE_LOCATIONS[gym.location] || {
      lat: 35.6762 + (index % 5 - 2) * 0.02, // -0.04から+0.04の範囲
      lng: 139.6503 + (Math.floor(index / 5) % 5 - 2) * 0.02
    };
    
    return {
      ...gym,
      lat: coords.lat,
      lng: coords.lng
    };
  });

  const handleGymClick = (gym: Gym) => {
    setSelectedGym(gym);
  };

  const openInGoogleMaps = (gym: Gym) => {
    const query = gym.lat && gym.lng 
      ? `${gym.lat},${gym.lng}`
      : encodeURIComponent(gym.name + ' ' + (gym.address || gym.location));
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank');
  };

  return (
    <div className="relative h-full bg-gray-50 rounded-xl overflow-hidden border-2 border-red-500" style={{ height }}>
      {/* デバッグ情報 */}
      <div className="absolute top-2 left-2 bg-white p-2 rounded shadow z-50 text-xs">
        <p>SearchResultMap Loaded</p>
        <p>Gyms: {gyms.length}</p>
        <p>Height: {height}</p>
      </div>
      
      {/* 背景地図のプレースホルダー */}
      <div className="absolute inset-0">
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 relative">
          {/* 地図風の背景パターン */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d1d5db" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* 道路風のライン */}
          <div className="absolute top-1/3 left-0 right-0 h-1 bg-gray-300 opacity-30"></div>
          <div className="absolute top-2/3 left-0 right-0 h-1 bg-gray-300 opacity-30"></div>
          <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-gray-300 opacity-30"></div>
          <div className="absolute left-3/4 top-0 bottom-0 w-1 bg-gray-300 opacity-30"></div>
        </div>
        
        {/* ジムピン */}
        {gymsWithCoords.map((gym, index) => {
          // 画面内での位置を計算（パーセンテージベース）
          const x = 20 + (index % 5) * 15; // 20%, 35%, 50%, 65%, 80%
          const y = 20 + (Math.floor(index / 5) % 4) * 20; // 20%, 40%, 60%, 80%
          
          return (
            <button
              key={gym.id}
              onClick={() => handleGymClick(gym)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all z-10 ${
                selectedGym?.id === gym.id ? 'scale-125 z-20' : 'hover:scale-110'
              }`}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="relative">
                <div className={`w-8 h-8 rounded-full shadow-lg flex items-center justify-center ${
                  selectedGym?.id === gym.id 
                    ? 'bg-red-500 ring-2 ring-white ring-offset-2' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}>
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                
                {/* ピンのラベル */}
                <div className={`absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md whitespace-nowrap text-xs border transition-opacity ${
                  selectedGym?.id === gym.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  {gym.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 選択されたジムの詳細カード */}
      {selectedGym && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80 bg-white rounded-xl shadow-xl p-4 border border-slate-200 z-30">
          <button
            onClick={() => setSelectedGym(null)}
            className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
          
          <div className="pr-8">
            <h3 className="font-bold text-lg text-slate-900 mb-2">{selectedGym.name}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <MapPin className="w-4 h-4" />
              <span>{selectedGym.location} • {selectedGym.distance}</span>
            </div>
            
            {selectedGym.price && (
              <p className="text-lg font-semibold text-blue-600 mb-3">
                {selectedGym.price}
              </p>
            )}

            {selectedGym.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedGym.tags.slice(0, 4).map((tag: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-violet-100 text-indigo-900 rounded-lg text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button 
                onClick={() => openInGoogleMaps(selectedGym)}
                className="flex-1 py-2 px-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Google Maps
              </button>
              <button 
                onClick={() => onGymSelect(selectedGym.id)}
                className="flex-1 py-2 px-3 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                詳細を見る
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ジム一覧（サイドパネル） */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 w-60 max-h-80 overflow-y-auto z-20">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">ジム一覧</p>
          <span className="text-xs text-gray-500">{gyms.length}件</span>
        </div>
        
        <div className="space-y-2">
          {gymsWithCoords.map((gym) => (
            <button
              key={gym.id}
              onClick={() => handleGymClick(gym)}
              className={`w-full text-left p-2 rounded-lg text-sm transition-all border ${
                selectedGym?.id === gym.id 
                  ? 'bg-blue-50 border-blue-300 text-blue-900' 
                  : 'border-gray-200 hover:bg-gray-50 text-gray-900'
              }`}
            >
              <p className="font-medium">{gym.name}</p>
              <p className="text-xs text-gray-500 mt-1">{gym.location}</p>
              {gym.price && (
                <p className="text-xs text-blue-600 font-medium mt-1">{gym.price}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 地図の説明 */}
      <div className="absolute bottom-2 right-2 bg-white/90 rounded px-2 py-1">
        <span className="text-xs text-slate-600">© ジムトピア マップ</span>
      </div>
    </div>
  );
}