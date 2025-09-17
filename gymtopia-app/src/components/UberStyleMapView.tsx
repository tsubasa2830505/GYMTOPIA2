'use client';

import { useState, useRef, useEffect } from 'react';
import { DatabaseGym } from '@/types/database';
import { GymDistanceCard } from './GymDistanceCard';
import { ClientOnlyMap } from './ClientOnlyMap';

interface UberStyleMapViewProps {
  gyms: DatabaseGym[];
  userLocation?: { lat: number; lng: number } | null;
  onGymSelect?: (gym: DatabaseGym) => void;
  onBackToList?: () => void;
}

type SheetPosition = 'mini' | 'half' | 'full';

export function UberStyleMapView({ gyms, userLocation, onGymSelect, onBackToList }: UberStyleMapViewProps) {
  const [selectedGym, setSelectedGym] = useState<DatabaseGym | null>(null);
  const [sheetPosition, setSheetPosition] = useState<SheetPosition>('mini');
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Sheet heights for different positions
  const getSheetHeight = (position: SheetPosition) => {
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    switch (position) {
      case 'mini':
        return 140; // Increased for better visibility
      case 'half':
        return vh * 0.45; // Increased to 45%
      case 'full':
        return vh * 0.8; // Reduced to 80% to keep some map visible
    }
  };

  // Handle touch/mouse start
  const handleStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setCurrentY(clientY);
  };

  // Handle touch/mouse move
  const handleMove = (clientY: number) => {
    if (!isDragging) return;
    setCurrentY(clientY);
  };

  // Handle touch/mouse end
  const handleEnd = () => {
    if (!isDragging) return;

    const diff = startY - currentY;
    const threshold = 80; // Increased threshold for better control

    // Swipe up (more sensitive)
    if (diff > threshold) {
      if (sheetPosition === 'mini') setSheetPosition('half');
      else if (sheetPosition === 'half') setSheetPosition('full');
    }
    // Swipe down (more sensitive)
    else if (diff < -threshold) {
      if (sheetPosition === 'full') setSheetPosition('half');
      else if (sheetPosition === 'half') setSheetPosition('mini');
    }

    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

  // Handle gym selection
  const handleGymClick = (gym: DatabaseGym) => {
    setSelectedGym(gym);
    setSheetPosition('half');
    if (onGymSelect) onGymSelect(gym);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse event handlers (for desktop testing) - only on drag handle
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      handleMove(e.clientY);
    }
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) handleEnd();
  };

  // Calculate sheet transform
  const getSheetTransform = () => {
    const baseHeight = getSheetHeight(sheetPosition);
    if (isDragging && startY && currentY) {
      const diff = startY - currentY;
      return `translateY(${-baseHeight - diff}px)`;
    }
    return `translateY(${-baseHeight}px)`;
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 'calc(100vh - 160px)' }}>
      {/* Map container */}
      <div className="absolute inset-0">
        <ClientOnlyMap
          gyms={gyms}
          selectedGym={selectedGym}
          onMarkerClick={handleGymClick}
          userLocation={userLocation}
        />
      </div>

      {/* Floating action buttons */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        {onBackToList && (
          <button
            className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
            onClick={onBackToList}
            title="リスト表示に戻る"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        )}
        <button
          className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => {
            // Center on user location
            if (userLocation) {
              window.location.reload(); // Simple reload for now
            }
          }}
          title="現在地に移動"
        >
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Instructions overlay for first-time users */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">地図の使い方</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• 📍 地図上のマーカーをタップしてジム詳細を表示</li>
          <li>• 👆 下部のシートをスワイプまたはタップで操作</li>
          <li>• 📋 リストボタンで一覧表示に戻る</li>
        </ul>
      </div>

      {/* Bottom sheet */}
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out z-40 ${
          isDragging ? '' : 'transition-transform'
        }`}
        style={{
          transform: getSheetTransform(),
          height: '100vh',
          touchAction: 'none'
        }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Sheet header */}
        <div className="px-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (sheetPosition === 'mini') setSheetPosition('half');
                else if (sheetPosition === 'half') setSheetPosition('full');
              }}
              className="flex-1 text-left"
            >
              <h2 className="text-lg font-semibold">
                {sheetPosition === 'mini' ? '近くのジム' : `${gyms.length}件のジム`}
              </h2>
              <p className="text-sm text-gray-500">
                {sheetPosition === 'mini' ? 'タップして展開' : 'スワイプまたはタップで操作'}
              </p>
            </button>
            <div className="flex gap-2">
              {sheetPosition !== 'full' && (
                <button
                  onClick={() => setSheetPosition('full')}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  title="全画面表示"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 14l9-9 9 9M5 14v7h14v-7" />
                  </svg>
                </button>
              )}
              {sheetPosition !== 'mini' && (
                <button
                  onClick={() => setSheetPosition('mini')}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  title="最小化"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Gym list */}
        <div className="overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
          <div className="p-4 space-y-3">
            {sheetPosition === 'mini' ? (
              // Show only nearest gym in mini view
              gyms.slice(0, 1).map(gym => (
                <div
                  key={gym.id}
                  onClick={() => handleGymClick(gym)}
                  className="cursor-pointer"
                >
                  <GymDistanceCard
                    gym={gym}
                    userLocation={userLocation || undefined}
                    showDetails={false}
                  />
                </div>
              ))
            ) : (
              // Show all gyms in half/full view
              gyms.map(gym => (
                <div
                  key={gym.id}
                  onClick={() => handleGymClick(gym)}
                  className={`cursor-pointer transition-all ${
                    selectedGym?.id === gym.id
                      ? 'ring-2 ring-blue-500 rounded-lg'
                      : ''
                  }`}
                >
                  <GymDistanceCard
                    gym={gym}
                    userLocation={userLocation || undefined}
                    showDetails={sheetPosition === 'full'}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}