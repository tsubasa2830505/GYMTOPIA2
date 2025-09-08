'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Navigation, ExternalLink } from 'lucide-react';
import { getGyms } from '@/lib/supabase/gyms';

interface Gym {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  equipment: string[];
}

const defaultGyms: Gym[] = [
  {
    id: '1',
    name: 'ゴールドジム 渋谷東京',
    address: '東京都渋谷区渋谷1-23-16',
    lat: 35.6595,
    lng: 139.7004,
    equipment: ['ベンチプレス', 'スクワットラック', 'ダンベル', 'ケーブルマシン'],
  },
  {
    id: '2',
    name: 'エニタイムフィットネス 新宿西口',
    address: '東京都新宿区西新宿1-18-2',
    lat: 35.6896,
    lng: 139.6995,
    equipment: ['トレッドミル', 'エアロバイク', 'フリーウェイト'],
  },
  {
    id: '3',
    name: 'ティップネス 池袋',
    address: '東京都豊島区西池袋1-17-10',
    lat: 35.7295,
    lng: 139.7109,
    equipment: ['プール', 'スタジオ', 'サウナ', 'マシンエリア'],
  },
  {
    id: '4',
    name: 'コナミスポーツクラブ 恵比寿',
    address: '東京都渋谷区恵比寿4-20-3',
    lat: 35.6462,
    lng: 139.7196,
    equipment: ['プール', 'ジャグジー', 'スタジオ', 'パーソナルトレーニング'],
  },
  {
    id: '5',
    name: 'JOYFIT24 原宿',
    address: '東京都渋谷区神宮前1-10-34',
    lat: 35.6707,
    lng: 139.7024,
    equipment: ['24時間営業', 'シャワー', 'フリーウェイト', 'マシン'],
  }
];

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([]);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);

  const equipmentOptions = [
    'フリーウェイト',
    'マシン',
    'プール',
    'スタジオ',
    'サウナ',
    '24時間営業',
    'パーソナルトレーニング'
  ];

  // Load gyms from database on mount
  useEffect(() => {
    loadGyms();
  }, []);

  const loadGyms = async () => {
    setLoading(true);
    try {
      const gymsData = await getGyms();
      
      // Map the data to the expected format
      const formattedGyms = gymsData.map(gym => ({
        id: gym.id,
        name: gym.name,
        address: gym.address || '',
        lat: gym.latitude || 35.6762,  // Default to Tokyo coordinates
        lng: gym.longitude || 139.6503,
        equipment: gym.equipment || []
      }));

      setGyms(formattedGyms.length > 0 ? formattedGyms : defaultGyms);
      setFilteredGyms(formattedGyms.length > 0 ? formattedGyms : defaultGyms);
    } catch (error) {
      console.error('Error loading gyms:', error);
      setGyms(defaultGyms);
      setFilteredGyms(defaultGyms);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = gyms;

    if (searchQuery) {
      filtered = filtered.filter(gym =>
        gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gym.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedEquipment.length > 0) {
      filtered = filtered.filter(gym =>
        selectedEquipment.some(eq => gym.equipment?.includes(eq))
      );
    }

    setFilteredGyms(filtered);
  }, [searchQuery, selectedEquipment, gyms]);

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment(prev =>
      prev.includes(equipment)
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
  };

  const openInGoogleMaps = (gym: Gym) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gym.name + ' ' + gym.address)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-16 z-40 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="ジム名や地域で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
                showFilters ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter size={20} />
              <span className="hidden sm:inline">フィルター</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold mb-2">設備で絞り込み:</p>
              <div className="flex flex-wrap gap-2">
                {equipmentOptions.map(equipment => (
                  <button
                    key={equipment}
                    onClick={() => toggleEquipment(equipment)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedEquipment.includes(equipment)
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border hover:bg-gray-100'
                    }`}
                  >
                    {equipment}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">ジムマップ</h1>
          <p className="text-sm text-gray-600">
            {filteredGyms.length} 件のジムを表示中
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* マップエリア */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 h-[600px] flex flex-col">
              {selectedGym ? (
                <>
                  <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2">{selectedGym.name}</h2>
                    <p className="text-gray-600 flex items-center gap-2">
                      <MapPin size={16} />
                      {selectedGym.address}
                    </p>
                  </div>
                  
                  <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedGym.lng-0.01},${selectedGym.lat-0.01},${selectedGym.lng+0.01},${selectedGym.lat+0.01}&layer=mapnik&marker=${selectedGym.lat},${selectedGym.lng}`}
                      style={{ border: 0 }}
                    />
                  </div>

                  <button
                    onClick={() => openInGoogleMaps(selectedGym)}
                    className="mt-4 w-full bg-blue-500 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                  >
                    <ExternalLink size={20} />
                    Google Mapsで開く
                  </button>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <MapPin size={48} className="mb-4" />
                  <p className="text-lg">ジムを選択してマップを表示</p>
                  <p className="text-sm mt-2">右側のリストからジムを選んでください</p>
                </div>
              )}
            </div>
          </div>

          {/* ジムリスト */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 max-h-[600px] overflow-y-auto">
              <h2 className="font-bold text-lg mb-3">ジム一覧</h2>
              <div className="space-y-3">
                {filteredGyms.map((gym) => (
                  <div
                    key={gym.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                      selectedGym?.id === gym.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedGym(gym)}
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
                        openInGoogleMaps(gym);
                      }}
                    >
                      <Navigation size={14} />
                      ルート案内
                    </button>
                  </div>
                ))}
                
                {filteredGyms.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>条件に一致するジムが見つかりません</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}