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
    switch (position) {
      case 'mini':
        return 120;
      case 'half':
        return window.innerHeight * 0.4;
      case 'full':
        return window.innerHeight * 0.85;
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
    const threshold = 50;

    // Swipe up
    if (diff > threshold) {
      if (sheetPosition === 'mini') setSheetPosition('half');
      else if (sheetPosition === 'half') setSheetPosition('full');
    }
    // Swipe down
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

  // Mouse event handlers (for desktop testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientY);
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
    <div className="relative w-full overflow-hidden" style={{ height: '70vh' }}>
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
        >
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => {
            // Toggle filter panel (future implementation)
          }}
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Sheet header */}
        <div className="px-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {sheetPosition === 'mini' ? '近くのジム' : `${gyms.length}件のジム`}
            </h2>
            {sheetPosition !== 'mini' && (
              <button
                onClick={() => setSheetPosition('mini')}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
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