'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Upload, Settings, LogOut, Star, User, Dumbbell, Plus, Trash2 } from 'lucide-react'

interface Equipment {
  id: string
  category: string
  name: string
  maker: string
  count?: number
  maxWeight?: number
}

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('facility')
  const [formData, setFormData] = useState({
    basicInfo: {
      name: 'ハンマーストレングス渋谷',
      area: '渋谷',
      address: '東京都渋谷区道玄坂1-1-1',
      openingHours: '24時間営業',
      monthlyFee: '12800',
      visitorFee: '3200'
    },
    services: {
      lockers: true,
      showers: true,
      twentyFourHours: true,
      parking: false,
      personalTraining: false,
      wifi: true,
      sauna: false,
      chalk: true
    }
  })

  // 設備管理用のステート
  const [newEquipment, setNewEquipment] = useState({
    category: '',
    name: '',
    maker: '',
    count: 1,
    maxWeight: 50
  })

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([
    { id: '1', category: 'パワーラック', name: 'エリートパワーラック', maker: 'ROGUE', count: 3 },
    { id: '2', category: 'ベンチプレス', name: 'コンペティションベンチ', maker: 'Hammer Strength', count: 5 },
    { id: '3', category: 'ダンベル', name: 'ヘックスダンベル', maker: 'ROGUE', maxWeight: 50 },
    { id: '4', category: 'パワーラック', name: 'モンスターラック', maker: 'ROGUE', count: 2 },
    { id: '5', category: 'ベンチプレス', name: 'オリンピックベンチ', maker: 'Life Fitness', count: 3 }
  ])

  const categories = ['パワーラック', 'ベンチプレス', 'ダンベル', 'ケーブルマシン', 'スミスマシン']
  const makers = ['ROGUE', 'Hammer Strength', 'Prime Fitness', 'Cybex', 'Life Fitness', 'Technogym']
  
  // カテゴリが能力値型かどうかを判定
  const isWeightType = (category: string) => {
    return category === 'ダンベル' || category === 'バーベル' || category === 'プレート'
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [field]: value
      }
    }))
  }

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: !prev.services[service as keyof typeof prev.services]
      }
    }))
  }

  const handleSubmit = () => {
    // 仮の保存処理
    console.log('保存データ:', formData)
    alert('施設情報を保存しました')
  }

  const handleAddEquipment = () => {
    if (!newEquipment.category || !newEquipment.name || !newEquipment.maker) {
      alert('すべての項目を入力してください')
      return
    }

    const equipment: Equipment = {
      id: Date.now().toString(),
      category: newEquipment.category,
      name: newEquipment.name,
      maker: newEquipment.maker,
      ...(isWeightType(newEquipment.category) 
        ? { maxWeight: newEquipment.maxWeight }
        : { count: newEquipment.count })
    }

    setEquipmentList([...equipmentList, equipment])
    setNewEquipment({
      category: '',
      name: '',
      maker: '',
      count: 1,
      maxWeight: 50
    })
  }

  const handleDeleteEquipment = (id: string) => {
    setEquipmentList(equipmentList.filter(item => item.id !== id))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-[73.5px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-[42px] h-[42px] bg-indigo-500 rounded-full flex items-center justify-center shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[21px] font-bold text-slate-900">ジムトピア</h1>
              <p className="text-[12.108px] text-slate-600">理想のジムを見つけよう</p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="max-w-[1008px] mx-auto px-0 py-[73.5px]">
        <div className="bg-white">
          {/* ページヘッダー */}
          <div className="px-3.5 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[17.5px] text-slate-600 mb-1">施設管理ページ</h2>
                <p className="text-[12.3px] text-slate-600">ハンマーストレングス渋谷</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                  <span className="text-[12.3px] text-slate-600">4.8</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-[12.3px] text-slate-600">128 イキタイ</span>
                </div>
              </div>
            </div>
          </div>

          {/* タブ */}
          <div className="px-[21px] pt-[28px]">
            <div className="bg-slate-50 rounded-[14.5px] p-[3px] flex gap-0">
              <button 
                onClick={() => setActiveTab('basic')}
                className={`flex-1 px-4 py-2 rounded-[14.5px] text-[12.3px] font-medium transition-all ${
                  activeTab === 'basic' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-900 hover:text-slate-700'
                }`}
              >
                基本情報
              </button>
              <button 
                onClick={() => setActiveTab('facility')}
                className={`flex-1 px-4 py-2 rounded-[14.5px] text-[12.3px] font-medium transition-all ${
                  activeTab === 'facility' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-900 hover:text-slate-700'
                }`}
              >
                設備管理
              </button>
              <button 
                onClick={() => setActiveTab('review')}
                className={`flex-1 px-4 py-2 rounded-[14.5px] text-[12.108px] font-medium transition-all ${
                  activeTab === 'review' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-900 hover:text-slate-700'
                }`}
              >
                レビュー管理
              </button>
              <button 
                onClick={() => setActiveTab('stats')}
                className={`flex-1 px-4 py-2 rounded-[14.5px] text-[12.3px] font-medium transition-all ${
                  activeTab === 'stats' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-900 hover:text-slate-700'
                }`}
              >
                統計情報
              </button>
            </div>
          </div>

          {/* フォームパネル */}
          <div className="px-[21px] pt-[28px] pb-[21px]">
            {activeTab === 'basic' && (
              <div className="bg-white border border-slate-200 rounded-[14.5px] p-[22px]">
                {/* 基本情報 */}
                <div className="mb-6">
                  <h3 className="text-[14px] font-bold text-slate-900 mb-4">基本情報</h3>
            
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12.3px] text-slate-900 mb-2">
                        施設名
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-[8.5px] text-[12.3px] text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.basicInfo.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[12.3px] text-slate-900 mb-2">
                        エリア
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-[8.5px] text-[12.3px] text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.basicInfo.area}
                        onChange={(e) => handleInputChange('area', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12.3px] text-slate-900 mb-2">
                      住所
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-[8.5px] text-[12.3px] text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.basicInfo.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12.3px] text-slate-900 mb-2">
                        営業時間
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-[8.5px] text-[12.3px] text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.basicInfo.openingHours}
                        onChange={(e) => handleInputChange('openingHours', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[12.108px] text-slate-900 mb-2">
                        月額料金 (円)
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-[8.5px] text-[12.3px] text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.basicInfo.monthlyFee}
                        onChange={(e) => handleInputChange('monthlyFee', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12.108px] text-slate-900 mb-2">
                        ビジター料金 (円)
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-[8.5px] text-[12.3px] text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.basicInfo.visitorFee}
                        onChange={(e) => handleInputChange('visitorFee', e.target.value)}
                      />
                    </div>
                    <div></div>
                  </div>
                </div>
              </div>

              {/* 施設・サービス */}
              <div className="mb-6">
                <h3 className="text-[14px] font-bold text-slate-900 mb-4">施設・サービス</h3>
                
                <div className="grid grid-cols-4 gap-x-8 gap-y-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => handleServiceToggle('showers')}
                      className={`relative w-7 h-4 rounded-full transition-colors ${
                        formData.services.showers ? 'bg-indigo-500' : 'bg-slate-400'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                        formData.services.showers ? 'translate-x-[13px]' : 'translate-x-[1px]'
                      }`} />
                    </button>
                    <span className="text-[12.3px] text-slate-900">シャワー</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => handleServiceToggle('lockers')}
                      className={`relative w-7 h-4 rounded-full transition-colors ${
                        formData.services.lockers ? 'bg-indigo-500' : 'bg-slate-400'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                        formData.services.lockers ? 'translate-x-[13px]' : 'translate-x-[1px]'
                      }`} />
                    </button>
                    <span className="text-[12.3px] text-slate-900">ロッカー</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => handleServiceToggle('parking')}
                      className={`relative w-7 h-4 rounded-full transition-colors ${
                        formData.services.parking ? 'bg-indigo-500' : 'bg-slate-400'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                        formData.services.parking ? 'translate-x-[13px]' : 'translate-x-[1px]'
                      }`} />
                    </button>
                    <span className="text-[12.3px] text-slate-900">駐車場</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => handleServiceToggle('wifi')}
                      className={`relative w-7 h-4 rounded-full transition-colors ${
                        formData.services.wifi ? 'bg-indigo-500' : 'bg-slate-400'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                        formData.services.wifi ? 'translate-x-[13px]' : 'translate-x-[1px]'
                      }`} />
                    </button>
                    <span className="text-[12.3px] text-slate-900">Wi-Fi</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => handleServiceToggle('twentyFourHours')}
                      className={`relative w-7 h-4 rounded-full transition-colors ${
                        formData.services.twentyFourHours ? 'bg-indigo-500' : 'bg-slate-400'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                        formData.services.twentyFourHours ? 'translate-x-[13px]' : 'translate-x-[1px]'
                      }`} />
                    </button>
                    <span className="text-[12.3px] text-slate-900">24時間営業</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => handleServiceToggle('chalk')}
                      className={`relative w-7 h-4 rounded-full transition-colors ${
                        formData.services.chalk ? 'bg-indigo-500' : 'bg-slate-400'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                        formData.services.chalk ? 'translate-x-[13px]' : 'translate-x-[1px]'
                      }`} />
                    </button>
                    <span className="text-[12.3px] text-slate-900">チョーク利用可</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => handleServiceToggle('personalTraining')}
                      className={`relative w-7 h-4 rounded-full transition-colors ${
                        formData.services.personalTraining ? 'bg-indigo-500' : 'bg-slate-400'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                        formData.services.personalTraining ? 'translate-x-[13px]' : 'translate-x-[1px]'
                      }`} />
                    </button>
                    <span className="text-[12.3px] text-slate-900">パーソナル</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => handleServiceToggle('sauna')}
                      className={`relative w-7 h-4 rounded-full transition-colors ${
                        formData.services.sauna ? 'bg-indigo-500' : 'bg-slate-400'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                        formData.services.sauna ? 'translate-x-[13px]' : 'translate-x-[1px]'
                      }`} />
                    </button>
                    <span className="text-[12.3px] text-slate-900">サウナ</span>
                  </label>
                </div>
              </div>

                {/* 保存ボタン */}
                <button
                  onClick={handleSubmit}
                  className="w-full px-6 py-2 bg-indigo-500 text-white text-[12.108px] font-medium rounded-[8.5px] hover:bg-indigo-600 transition flex items-center justify-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  基本情報を保存
                </button>
              </div>
            )}

            {/* 設備管理タブ */}
            {activeTab === 'facility' && (
              <div className="space-y-6">
                {/* 新規設備追加フォーム */}
                <div className="bg-white border border-slate-200 rounded-[14.5px] p-[22px]">
                  <h3 className="text-[14px] font-bold text-slate-900 mb-4">設備情報管理</h3>
                  
                  <div className="mb-6">
                    <h4 className="text-[12.3px] font-medium text-slate-700 mb-3">新しい設備を追加</h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[12.3px] text-slate-900 mb-2">
                            カテゴリ
                          </label>
                          <select
                            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-[8.5px] text-[12.3px] text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            value={newEquipment.category}
                            onChange={(e) => setNewEquipment({...newEquipment, category: e.target.value})}
                          >
                            <option value="">選択してください</option>
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-[12.3px] text-slate-900 mb-2">
                            設備名
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-[8.5px] text-[12.3px] text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            value={newEquipment.name}
                            onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                            placeholder="例: エリートパワーラック"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[12.3px] text-slate-900 mb-2">
                            メーカー
                          </label>
                          <select
                            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-[8.5px] text-[12.3px] text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            value={newEquipment.maker}
                            onChange={(e) => setNewEquipment({...newEquipment, maker: e.target.value})}
                          >
                            <option value="">選択してください</option>
                            {makers.map(maker => (
                              <option key={maker} value={maker}>{maker}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-[12.3px] text-slate-900 mb-2">
                            {newEquipment.category && isWeightType(newEquipment.category) 
                              ? '最大重量 (kg)' 
                              : '台数'}
                          </label>
                          {newEquipment.category && isWeightType(newEquipment.category) ? (
                            <input
                              type="number"
                              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-[8.5px] text-[12.3px] text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              value={newEquipment.maxWeight}
                              onChange={(e) => setNewEquipment({...newEquipment, maxWeight: parseInt(e.target.value) || 0})}
                              min="1"
                              max="999"
                            />
                          ) : (
                            <input
                              type="number"
                              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-[8.5px] text-[12.3px] text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              value={newEquipment.count}
                              onChange={(e) => setNewEquipment({...newEquipment, count: parseInt(e.target.value) || 0})}
                              min="1"
                              max="999"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleAddEquipment}
                    className="w-full px-6 py-2.5 bg-indigo-500 text-white text-[12.3px] font-medium rounded-[8.5px] hover:bg-indigo-600 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    設備を追加
                  </button>
                </div>
                
                {/* 設備一覧 */}
                <div className="bg-white border border-slate-200 rounded-[14.5px] p-[22px]">
                  <h3 className="text-[14px] font-bold text-slate-900 mb-4">現在の設備一覧</h3>
                  
                  <div className="space-y-3">
                    {equipmentList.map((equipment) => (
                      <div key={equipment.id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md">
                            {equipment.category}
                          </span>
                          <span className="text-[13px] font-bold text-slate-900">
                            {equipment.name}
                          </span>
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-md">
                            {equipment.maker}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-[13px] font-medium text-slate-700">
                            {equipment.count !== undefined 
                              ? `${equipment.count}台` 
                              : `最大${equipment.maxWeight}kg`}
                          </span>
                          <button
                            onClick={() => handleDeleteEquipment(equipment.id)}
                            className="text-red-500 hover:text-red-700 transition p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {equipmentList.length === 0 && (
                      <div className="text-center py-8 text-slate-500 text-[12.3px]">
                        設備が登録されていません
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}