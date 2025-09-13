'use client'

import { useState, useEffect } from 'react'
import { Upload, Dumbbell, Plus, Trash2, Send, Heart, Users, TrendingUp, Activity } from 'lucide-react'
import Image from 'next/image'
import { getGyms } from '@/lib/supabase/gyms'
import { getGymAdminStatistics, getTimeBasedPostDistribution, getFrequentPosters } from '@/lib/supabase/admin-statistics'
import { getUserManagedGyms, updateGymBasicInfo } from '@/lib/supabase/admin'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'

interface Equipment {
  id: string
  category: string
  name: string
  maker: string
  count?: number
  maxWeight?: number
}

interface Review {
  id: string
  author: {
    name: string
    avatar?: string
    initial?: string
  }
  date: string
  content: string
  reply?: {
    storeName: string
    role: string
    content: string
    date: string
  }
}

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('basic')
  const [selectedGym, setSelectedGym] = useState<any>(null)
  const [gyms, setGyms] = useState<any[]>([])
  const [managedGyms, setManagedGyms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [timeDistribution, setTimeDistribution] = useState<any[]>([])
  const [frequentPosters, setFrequentPosters] = useState<any[]>([])
  const [hasAccess, setHasAccess] = useState(false)
  const [authUser, setAuthUser] = useState<any>(null)
  
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

  // レビュー管理用のステート
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      author: { name: '筋トレ愛好家', initial: '筋' },
      date: '2024年1月15日',
      content: 'ROGUEのパワーラックが4台もあって、待ち時間ほぼゼロ！\nフリーウェイトエリアも広くて、混雑時でも快適にトレーニングできます。\n24時間営業なのも最高です。'
    },
    {
      id: '2',
      author: { name: 'フィットネス女子', initial: 'フ' },
      date: '2024年1月14日',
      content: '設備は充実していて文句なし！\nただ、女性更衣室がもう少し広いと嬉しいです。\nスタッフの対応は親切で、初心者にも優しく教えてくれます。',
      reply: {
        storeName: 'ハンマーストレングス渋谷',
        role: 'オーナー',
        content: 'ご利用ありがとうございます！\n女性更衣室の件、貴重なご意見として検討させていただきます。\n今後ともよろしくお願いいたします。',
        date: '2024年1月14日'
      }
    },
    {
      id: '3',
      author: { name: 'ベンチプレス戦士', avatar: '/avatar3.jpg', initial: 'ベ' },
      date: '2024年1月13日',
      content: 'ベンチプレス台が5台もある！\nしかも全部ELEIKO製で最高の環境です。\nプレートも豊富で、高重量トレーニングにも対応できます。',
      reply: {
        storeName: 'ハンマーストレングス渋谷',
        role: 'オーナー',
        content: 'お褒めの言葉ありがとうございます！\nELEIKO製品は特にこだわって導入しました。\n今後も快適なトレーニング環境を提供できるよう努めます。',
        date: '2024年1月13日'
      }
    },
    {
      id: '4',
      author: { name: 'カーディオ派', initial: 'カ' },
      date: '2024年1月12日',
      content: 'トレッドミルとバイクの台数が多くて良い！\n有酸素エリアも広々としています。\nシャワールームも清潔で快適です。'
    },
    {
      id: '5',
      author: { name: 'パワーリフター', avatar: '/avatar5.jpg', initial: 'パ' },
      date: '2024年1月11日',
      content: 'パワーリフティング3種目に特化した設備が完璧！\nチョークも使えるし、プラットフォームも複数あります。\n本格的にトレーニングしたい人には最高の環境です。',
      reply: {
        storeName: 'ハンマーストレングス渋谷',
        role: 'オーナー',
        content: 'ありがとうございます！\nパワーリフターの方にも満足いただける設備を心がけています。\n大会前のトレーニングなど、ぜひご活用ください。',
        date: '2024年1月11日'
      }
    }
  ])
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({})

  const categories = ['パワーラック', 'ベンチプレス', 'ダンベル', 'ケーブルマシン', 'スミスマシン']
  const makers = ['ROGUE', 'Hammer Strength', 'Prime Fitness', 'Cybex', 'Life Fitness', 'Technogym']
  
  // Load managed gyms on mount when user is authenticated
  useEffect(() => {
    // 認証状態に関わらず、ロード関数を呼び出す
    // loadManagedGyms内でSupabaseから直接認証情報を取得する
    loadManagedGyms()
  }, [])
  
  // Load statistics when gym is selected
  useEffect(() => {
    if (selectedGym) {
      loadGymStatistics(selectedGym.id)
    }
  }, [selectedGym])
  
  const loadManagedGyms = async () => {
    setLoading(true)
    try {
      // Supabaseから直接認証ユーザーを取得
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      
      setAuthUser(supabaseUser)
      
      if (!supabaseUser) {
        console.log('No authenticated user found from Supabase')
        setHasAccess(false)
        setLoading(false)
        return
      }
      
      console.log('Loading managed gyms for user:', supabaseUser.id, supabaseUser.email)
      
      // ユーザーが管理するジムのみを取得
      const managedData = await getUserManagedGyms()
      
      console.log('Managed gyms data received:', managedData)
      
      if (!managedData || managedData.length === 0) {
        console.log('No managed gyms found for user')
        setHasAccess(false)
        setLoading(false)
        return
      }
      
      setHasAccess(true)
      const gymsData = managedData.map((item: any) => item.gym)
      setManagedGyms(gymsData)
      setGyms(gymsData) // 互換性のため両方にセット
      
      // Select first gym by default
      if (gymsData.length > 0) {
        const firstGym = gymsData[0]
        setSelectedGym(firstGym)
        setFormData({
          basicInfo: {
            name: firstGym.name || 'ハンマーストレングス渋谷',
            area: firstGym.city || '渋谷',
            address: firstGym.address || '東京都渋谷区道玄坂1-1-1',
            openingHours: firstGym.business_hours?.weekday || '24時間営業',
            monthlyFee: firstGym.price_info?.monthly || '12800',
            visitorFee: firstGym.price_info?.visitor || '3200'
          },
          services: {
            lockers: firstGym.facilities?.lockers || true,
            showers: firstGym.facilities?.showers || true,
            twentyFourHours: firstGym.business_hours?.is_24h || true,
            parking: firstGym.facilities?.parking || false,
            personalTraining: firstGym.facilities?.personal_training || false,
            wifi: firstGym.facilities?.wifi || true,
            sauna: firstGym.facilities?.sauna || false,
            chalk: firstGym.facilities?.chalk_allowed || true
          }
        })
        
        // Set equipment list from gym data
        if (firstGym.equipment_types) {
          const equipmentFromGym = firstGym.equipment_types.map((type: string, index: number) => ({
            id: `gym-${index}`,
            category: type,
            name: type,
            maker: 'ROGUE',
            count: Math.floor(Math.random() * 5) + 1
          }))
          setEquipmentList(equipmentFromGym)
        }
      }
    } catch (error) {
      console.error('Error loading gyms:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const loadGymStatistics = async (gymId: string) => {
    try {
      const [gymStats, timeDist, posters] = await Promise.all([
        getGymAdminStatistics(gymId),
        getTimeBasedPostDistribution(gymId),
        getFrequentPosters(gymId)
      ])
      
      setStats(gymStats)
      setTimeDistribution(timeDist)
      setFrequentPosters(posters)
    } catch (error) {
      console.error('Error loading gym statistics:', error)
      // Use default values if error
      setStats({
        monthlyPosts: 234,
        postGrowth: '18.2',
        likesCount: 342,
        likesGrowth: '12.5',
        crowdReports: {
          total: 72,
          empty: 23,
          normal: 0,
          crowded: 49
        },
        equipmentMentions: [
          { name: 'パワーラック', count: 87 },
          { name: 'ベンチプレス', count: 76 },
          { name: 'ダンベル', count: 63 },
          { name: 'ケーブルマシン', count: 34 },
          { name: 'スミスマシン', count: 28 }
        ]
      })
    }
  }
  
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
    console.log('Adding equipment:', newEquipment)
    
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

    console.log('New equipment object:', equipment)
    const updatedList = [...equipmentList, equipment]
    console.log('Updated equipment list:', updatedList)
    
    setEquipmentList(updatedList)
    setNewEquipment({
      category: '',
      name: '',
      maker: '',
      count: 1,
      maxWeight: 50
    })
    
    alert('設備を追加しました')
  }

  const handleDeleteEquipment = (id: string) => {
    setEquipmentList(equipmentList.filter(item => item.id !== id))
  }

  // レビュー管理用のハンドラー
  const handleReplyChange = (reviewId: string, text: string) => {
    setReplyTexts(prev => ({
      ...prev,
      [reviewId]: text
    }))
  }

  const handleReplySubmit = (reviewId: string) => {
    const replyText = replyTexts[reviewId]
    if (!replyText || replyText.trim() === '') return

    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          reply: {
            storeName: 'ハンマーストレングス渋谷',
            role: 'オーナー',
            content: replyText,
            date: new Date().toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          }
        }
      }
      return review
    }))

    setReplyTexts(prev => ({
      ...prev,
      [reviewId]: ''
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent, reviewId: string) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleReplySubmit(reviewId)
    }
  }


  // ローディング中の表示
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  // アクセス権限がない場合でも管理画面を表示（デモ用）
  // 本番環境では以下のコメントを外してアクセス制御を有効にする
  /*
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">管理画面へのアクセス</h2>
          <p className="text-gray-600 mb-6">
            {authUser ? 'ジムオーナーとしての登録が必要です。' : 'ログインが必要です。'}
          </p>
          <div className="flex flex-col gap-3">
            {!authUser ? (
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium"
              >
                ログインする
              </button>
            ) : (
              <button
                onClick={() => router.push('/owner-application')}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
              >
                ジムオーナー申請はこちら
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    )
  }
  */

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
      <div className="max-w-[1008px] mx-auto px-0 py-4 sm:py-6">
        <div className="bg-white">
          {/* ページヘッダー */}
          <div className="px-3.5 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[17.5px] text-slate-600 mb-1">施設管理ページ</h2>
                <p className="text-[12.3px] text-slate-600">{selectedGym?.name || 'ハンマーストレングス渋谷'}</p>
              </div>
              <div className="flex items-center gap-4">
                {gyms.length > 1 && (
                  <select 
                    className="text-[12.3px] px-2 py-1 border border-slate-200 rounded-md"
                    value={selectedGym?.id || ''}
                    onChange={(e) => {
                      const gym = gyms.find(g => g.id === e.target.value)
                      if (gym) {
                        setSelectedGym(gym)
                        // Update form data with selected gym
                        setFormData({
                          basicInfo: {
                            name: gym.name || 'ハンマーストレングス渋谷',
                            area: gym.city || '渋谷',
                            address: gym.address || '東京都渋谷区道玄坂1-1-1',
                            openingHours: gym.business_hours?.weekday || '24時間営業',
                            monthlyFee: gym.price_info?.monthly || '12800',
                            visitorFee: gym.price_info?.visitor || '3200'
                          },
                          services: formData.services
                        })
                      }
                    }}
                  >
                    {gyms.map(gym => (
                      <option key={gym.id} value={gym.id}>{gym.name}</option>
                    ))}
                  </select>
                )}
                <div className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[12.3px] text-slate-600">{stats?.likesCount || 342} イキタイ</span>
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

            {/* 統計情報タブ */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                {/* 統計概要 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12.3px] text-slate-700">今月の投稿数</span>
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-xl font-bold text-slate-900">234件</div>
                    <div className="text-[10px] text-slate-600 mt-1">前月比: +18.2%</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12.3px] text-slate-700">イキタイ数</span>
                      <Heart className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-xl font-bold text-slate-900">342人</div>
                    <div className="text-[10px] text-slate-600 mt-1">前月比: +12.5%</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12.3px] text-slate-700">混雑報告</span>
                      <Activity className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="text-xl font-bold text-slate-900">72件</div>
                    <div className="text-[10px] text-slate-600 mt-1">空き: 23件, 混雑: 49件</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12.3px] text-slate-700">設備言及</span>
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-xl font-bold text-slate-900">288回</div>
                    <div className="text-[10px] text-slate-600 mt-1">5種類の設備</div>
                  </div>
                </div>

                {/* 時間帯別投稿分析 */}
                <div className="bg-white border border-slate-200 rounded-[14.5px] p-[22px]">
                  <h3 className="text-[14px] font-bold text-slate-900 mb-4">時間帯別ジム活投稿</h3>
                  <div className="space-y-3">
                    {[
                      { time: '5:00-9:00', posts: 28, percentage: 12.0, color: 'bg-blue-500', crowd: '空いてる' },
                      { time: '9:00-12:00', posts: 15, percentage: 6.4, color: 'bg-green-500', crowd: '空いてる' },
                      { time: '12:00-15:00', posts: 42, percentage: 17.9, color: 'bg-yellow-500', crowd: '普通' },
                      { time: '15:00-18:00', posts: 67, percentage: 28.6, color: 'bg-orange-500', crowd: '混雑' },
                      { time: '18:00-22:00', posts: 72, percentage: 30.8, color: 'bg-red-500', crowd: '混雑' },
                      { time: '22:00-24:00', posts: 10, percentage: 4.3, color: 'bg-purple-500', crowd: '空いてる' },
                    ].map((slot, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-20 text-[12.3px] font-medium text-slate-700">{slot.time}</div>
                        <div className="flex-1">
                          <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`absolute top-0 left-0 h-full ${slot.color} rounded-full transition-all duration-500`}
                              style={{ width: `${slot.percentage}%` }}
                            />
                            <div className="absolute inset-0 flex items-center px-3">
                              <span className="text-[11px] font-medium text-slate-700">
                                {slot.posts}件
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-600">
                          {slot.crowd}
                        </div>
                        <div className="text-[12.3px] text-slate-600 w-12 text-right">
                          {slot.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 投稿で言及された設備 */}
                <div className="bg-white border border-slate-200 rounded-[14.5px] p-[22px]">
                  <h3 className="text-[14px] font-bold text-slate-900 mb-4">投稿で言及された設備</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'パワーラック', mentions: 87, sentiment: '好評', trend: '+12件' },
                      { name: 'ベンチプレス', mentions: 76, sentiment: '好評', trend: '+8件' },
                      { name: 'ダンベル', mentions: 63, sentiment: '普通', trend: '+5件' },
                      { name: 'ケーブルマシン', mentions: 34, sentiment: '要改善', trend: '-3件' },
                      { name: 'スミスマシン', mentions: 28, sentiment: '普通', trend: '+2件' },
                    ].map((equipment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-[11px]">
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-[12.3px] font-medium text-slate-900">{equipment.name}</div>
                            <div className="text-[10px] text-slate-600">
                              言及数: {equipment.mentions}回
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            equipment.sentiment === '好評' ? 'bg-green-100 text-green-700' :
                            equipment.sentiment === '要改善' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {equipment.sentiment}
                          </span>
                          <div className={`text-[11px] font-medium ${
                            equipment.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {equipment.trend}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 投稿者分析 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 rounded-[14.5px] p-[22px]">
                    <h3 className="text-[14px] font-bold text-slate-900 mb-4">頻繁な投稿者</h3>
                    <div className="space-y-3">
                      {[
                        { name: '筋トレ愛好家', posts: 23, likes: 156, lastPost: '2日前' },
                        { name: 'ベンチプレスサー', posts: 18, likes: 98, lastPost: '昨日' },
                        { name: 'フィットネス女子', posts: 15, likes: 134, lastPost: '3日前' },
                        { name: 'パワーリフター', posts: 12, likes: 87, lastPost: '今日' },
                        { name: 'カーディオ派', posts: 9, likes: 45, lastPost: '5日前' },
                      ].map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-[12.3px] font-medium text-slate-900">{user.name}</div>
                              <div className="text-[10px] text-slate-600">投稿: {user.posts}件 • ♥ {user.likes}</div>
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-600">
                            {user.lastPost}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-[14.5px] p-[22px]">
                    <h3 className="text-[14px] font-bold text-slate-900 mb-4">月別投稿推移</h3>
                    <div className="space-y-3">
                      {[
                        { month: '8月', posts: 167, growth: '+8.4%' },
                        { month: '9月', posts: 182, growth: '+9.0%' },
                        { month: '10月', posts: 195, growth: '+7.1%' },
                        { month: '11月', posts: 203, growth: '+4.1%' },
                        { month: '12月', posts: 198, growth: '-2.5%' },
                        { month: '1月', posts: 234, growth: '+18.2%' },
                      ].map((data, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="text-[12.3px] text-slate-700 w-10">{data.month}</div>
                          <div className="flex-1 px-3">
                            <div className="text-[12.3px] font-medium text-slate-900">
                              {data.posts}件
                            </div>
                          </div>
                          <div className={`text-[11px] font-medium ${
                            data.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {data.growth}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* レビュー管理タブ */}
            {activeTab === 'review' && (
              <div>
                <h3 className="text-[14px] font-bold text-slate-900 mb-6">レビュー管理</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-[8.5px] p-4 text-center">
                    <div className="text-2xl font-bold text-slate-900 mb-1">{reviews.length}</div>
                    <div className="text-[12.3px] text-slate-600">レビュー件数</div>
                  </div>
                  <div className="bg-slate-50 rounded-[8.5px] p-4 text-center">
                    <div className="text-2xl font-bold text-slate-900 mb-1">342</div>
                    <div className="text-[12.3px] text-slate-600">イキタイ数</div>
                  </div>
                </div>

                {/* 全レビューリスト */}
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white rounded-[8.5px] p-4 border border-slate-200 hover:shadow-sm transition"
                    >
                      {/* Review Header */}
                      <div className="flex items-start gap-3 mb-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {review.author.avatar ? (
                            <Image
                              src={review.author.avatar}
                              alt={review.author.name}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-[12.3px] font-medium text-indigo-600">
                              {review.author.initial}
                            </span>
                          )}
                        </div>

                        {/* Meta Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-semibold text-[12.3px] text-slate-900">
                              {review.author.name}
                            </span>
                            <span className="text-[11px] text-slate-500">{review.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Review Content */}
                      <div className="ml-13 mb-4">
                        <p className="text-[12.3px] text-slate-700 whitespace-pre-wrap">{review.content}</p>
                      </div>

                      {/* Reply Section */}
                      <div className="ml-13">
                        {review.reply ? (
                          /* Replied State */
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] rounded-full font-medium">
                                {review.reply.storeName}
                              </span>
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] rounded-full">
                                {review.reply.role}
                              </span>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-[8.5px]">
                              <p className="text-[12.3px] text-slate-700 whitespace-pre-wrap">
                                {review.reply.content}
                              </p>
                            </div>
                          </div>
                        ) : (
                          /* Reply Input State */
                          <div className="space-y-3">
                            <textarea
                              value={replyTexts[review.id] || ''}
                              onChange={(e) => handleReplyChange(review.id, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, review.id)}
                              placeholder="このレビューに返信..."
                              className="w-full px-3 py-2 border border-slate-200 rounded-[8.5px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-[12.3px]"
                              rows={3}
                            />
                            <button
                              onClick={() => handleReplySubmit(review.id)}
                              disabled={!replyTexts[review.id] || replyTexts[review.id].trim() === ''}
                              className={`flex items-center gap-2 px-3 py-2 rounded-[8.5px] font-medium transition text-[12.3px] ${
                                replyTexts[review.id] && replyTexts[review.id].trim()
                                  ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <Send className="w-3 h-3" />
                              返信
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}