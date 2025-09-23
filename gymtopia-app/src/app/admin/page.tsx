'use client'

import { useState, useEffect } from 'react'
import { Upload, Dumbbell, Plus, Trash2, Heart, Users, Activity, Save, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { getGymAdminStatistics, getTimeBasedPostDistribution, getFrequentPosters } from '@/lib/supabase/admin-statistics'
import {
  getUserManagedGyms,
  updateGymBasicInfo,
  getGymEquipment,
  addGymEquipment,
  deleteGymEquipment
} from '@/lib/supabase/admin'
import {
  getGymDetailedInfoForOwner,
  upsertGymDetailedInfo,
  createInitialGymDetailedInfo
} from '@/lib/supabase/gym-detailed-info'
import type { GymDetailedInfo } from '@/lib/supabase/gym-detailed-info'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import {
  formatPhoneNumber,
  validatePhoneNumber,
  validateUrl,
  validateImageUrl,
  validateGymForm,
  TEXT_LIMITS,
  ERROR_MESSAGES
} from '@/lib/validation/gym-form'
import PricingSection from '@/components/GymOwnerForm/PricingSection'
import OperatingHoursSection from '@/components/GymOwnerForm/OperatingHoursSection'
import RulesSection from '@/components/GymOwnerForm/RulesSection'
import BeginnerSupportSection from '@/components/GymOwnerForm/BeginnerSupportSection'
import AccessInfoSection from '@/components/GymOwnerForm/AccessInfoSection'
import OtherInfoSection from '@/components/GymOwnerForm/OtherInfoSection'
import FacilitySection from './components/FacilitySection'

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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

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
      '24hours': true,
      shower: true,
      parking: false,
      locker: true,
      wifi: true,
      chalk: true,
      belt_rental: false,
      personal_training: false,
      group_lesson: false,
      studio: false,
      sauna: false,
      pool: false,
      jacuzzi: false,
      massage_chair: false,
      cafe: false,
      women_only: false,
      barrier_free: false,
      kids_room: false,
      english_support: false,
      drop_in: true
    }
  })

  // 設備管理用のステート
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([])

  // 詳細情報管理用の状態
  const [detailFormData, setDetailFormData] = useState<Partial<GymDetailedInfo>>({})
  const [activeDetailSection, setActiveDetailSection] = useState<string>('pricing')
  const [detailFormLoading, setDetailFormLoading] = useState(false)
  const [detailFormSaving, setDetailFormSaving] = useState(false)
  const [basicInfoSaving, setBasicInfoSaving] = useState(false)

  // Load managed gyms on mount when user is authenticated
  useEffect(() => {
    // 認証状態に関わらず、ロード関数を呼び出す
    // loadManagedGyms内でSupabaseから直接認証情報を取得する
    loadManagedGyms()
  }, [])

  // Load statistics and data when gym is selected
  useEffect(() => {
    if (selectedGym && authUser) {
      loadGymStatistics(selectedGym.id)
      loadGymEquipmentData(selectedGym.id)
      // loadGymDetailedInfo は loadManagedGyms で既に呼び出されているのでコメントアウト
      // loadGymDetailedInfo(selectedGym.id)
    }
  }, [selectedGym, authUser])

  const loadGymEquipmentData = async (gymId: string) => {
    try {
      const equipment = await getGymEquipment(gymId)
      const equipmentFromDB = [
        ...equipment.machines.map((m: any) => ({
          id: m.id,
          category: 'マシン',
          name: m.name,
          maker: m.brand || 'ROGUE',
          count: m.count || 1
        })),
        ...equipment.freeWeights.map((f: any) => ({
          id: f.id,
          category: 'フリーウェイト',
          name: f.name,
          maker: f.brand || 'ROGUE',
          maxWeight: parseInt(f.weight_range?.replace(/[^0-9]/g, '') || '50')
        }))
      ]

      if (equipmentFromDB.length > 0) {
        setEquipmentList(equipmentFromDB)
      }
    } catch (error) {
      console.error('Error loading equipment:', error)
    }
  }


  const loadGymDetailedInfo = async (gymId: string, userId?: string) => {
    // ユーザーIDを受け取るか、authUserから取得するか、Supabaseから直接取得
    let effectiveUserId = userId || authUser?.id;

    if (!effectiveUserId) {
      console.log('[Admin] Getting user from Supabase directly')
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser()
        if (supabaseUser) {
          effectiveUserId = supabaseUser.id;
          if (!authUser) {
            setAuthUser(supabaseUser);
          }
        }
      } catch (error) {
        console.error('[Admin] Error getting user from Supabase:', error)
      }
    }

    if (!effectiveUserId) {
      console.log('[Admin] No user ID available, skipping detailed info load')
      return
    }

    console.log('[Admin] Loading detailed info for gym:', gymId, 'with user:', effectiveUserId)
    setDetailFormLoading(true)
    try {
      const info = await getGymDetailedInfoForOwner(gymId, effectiveUserId)
      console.log('[Admin] Detailed info received:', info)
      if (info) {
        setDetailFormData(info)
        console.log('[Admin] DetailFormData set successfully')
      } else {
        // 詳細情報が存在しない場合は作成
        console.log('[Admin] No detailed info found, creating initial data')
        const newInfo = await createInitialGymDetailedInfo(gymId, effectiveUserId)
        if (newInfo) {
          setDetailFormData(newInfo)
          console.log('[Admin] Initial detailed info created')
        } else {
          setDetailFormData({})
        }
      }
    } catch (error) {
      console.error('Error loading gym detailed info:', error)
      setDetailFormData({})
    } finally {
      setDetailFormLoading(false)
    }
  }

  const handleDetailFormSave = async () => {
    console.log('詳細情報保存ボタンがクリックされました')
    console.log('selectedGym:', selectedGym)
    console.log('authUser:', authUser)
    console.log('detailFormData:', detailFormData)

    if (!selectedGym || !authUser) {
      console.log('[Admin] Cannot save: selectedGym:', selectedGym, 'authUser:', authUser)
      alert('ジムまたはユーザー情報が取得できません')
      return
    }

    console.log('[Admin] Saving detailed info for gym:', selectedGym.id)
    console.log('[Admin] Data to save:', detailFormData)

    setDetailFormSaving(true)
    try {
      const result = await upsertGymDetailedInfo(selectedGym.id, detailFormData, authUser.id)
      console.log('[Admin] Save result:', result)
      if (result) {
        alert('詳細情報を保存しました')
        // 保存後にデータを再読み込み
        loadGymDetailedInfo(selectedGym.id)
      } else {
        alert('保存に失敗しました')
      }
    } catch (error) {
      console.error('Error saving gym detailed info:', error)
      alert('保存エラーが発生しました')
    } finally {
      setDetailFormSaving(false)
    }
  }

  const updateDetailFormSection = (section: string, sectionData: any) => {
    console.log('[Admin] Updating section:', section, 'with data:', sectionData)
    setDetailFormData(prev => {
      const updated = {
        ...prev,
        [section]: sectionData
      }
      console.log('[Admin] Updated form data:', updated)
      return updated
    })
  }

  const loadManagedGyms = async () => {
    setLoading(true)
    try {
      // Supabaseから直接認証ユーザーを取得
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()

      // デバッグモードを有効化
      const DEBUG_MODE = true

      if (DEBUG_MODE && !supabaseUser) {
        console.log('DEBUG MODE: Loading Hammer Strength Shibuya')

        // ハンマーストレングス渋谷のデータを直接設定
        const debugGymData = [{
          id: 'debug-1',
          user_id: 'debug-user',
          gym_id: '03f2693a-49a1-41f4-bf4b-be5c192d4d32',
          role: 'owner',
          gym: {
            id: '03f2693a-49a1-41f4-bf4b-be5c192d4d32',
            name: 'ハンマーストレングス渋谷',
            area: '渋谷',
            prefecture: '東京都',
            address: '東京都渋谷区道玄坂1-1-1',
            lat: 35.6580,
            lng: 139.7017,
            has_24h: true,
            has_parking: false,
            has_shower: true
          }
        }]

        setManagedGyms(debugGymData)
        setGyms(debugGymData.map(g => g.gym))
        setSelectedGym(debugGymData[0].gym)
        setHasAccess(true)
        setAuthUser({ id: '8ac9e2a5-a702-4d04-b871-21e4a423b4ac', email: 'tsubasa.a.283.0505@gmail.com' })

        // 詳細情報を即座に読み込み
        console.log('DEBUG MODE: Loading detailed info immediately')
        loadGymDetailedInfo('03f2693a-49a1-41f4-bf4b-be5c192d4d32', '8ac9e2a5-a702-4d04-b871-21e4a423b4ac')

        // 強制的にテストデータを注入
        console.log('DEBUG MODE: Injecting test data directly')
        const testDetailData = {
          pricing_system: {
            monthly_fee: 12800,
            dropin_fee: 3200,
            enrollment_fee: 10000,
            membership_plans: [{
              name: 'レギュラー会員',
              price: 12800,
              duration: '月額',
              description: '24時間利用可能',
              features: ['24時間アクセス', 'シャワー利用可', 'ロッカー利用可']
            }],
            payment_methods: ['クレジットカード', '銀行振込', '現金'],
            cancellation_policy: '退会は月末の15日までに申請してください。'
          },
          operating_hours: {
            weekday: '24時間',
            saturday: '24時間',
            sunday: '24時間',
            holiday: '24時間',
            notes: '年中無休・24時間営業'
          },
          rules_and_policies: {
            general_rules: [
              '器具使用後は清拭してください',
              '大声での会話はお控えください',
              '器具の独占利用は30分までです',
              '室内用シューズ着用必須',
              '他の利用者への迷惑行為は禁止'
            ],
            dress_code: {
              required: ['室内シューズ', '運動着', 'タオル'],
              prohibited: ['サンダル', '裸足', 'ジーンズ']
            },
            age_restrictions: {
              minimum_age: 16,
              notes: '18歳未満は保護者同意書が必要'
            }
          },
          beginner_support: {
            orientation_available: true,
            orientation_details: '60分の無料説明会\n・施設の使い方説明\n・基本的なマシンの使い方指導\n・トレーニングプログラムの相談',
            free_consultation: true,
            consultation_details: '月1回の無料カウンセリング'
          },
          access_information: {
            nearest_station: 'JR渋谷駅',
            walking_time: '徒歩3分',
            address_details: '〒150-0043 東京都渋谷区道玄坂1-1-1\nハンマービル3-5F',
            parking_available: true,
            parking_details: '25台・会員2時間無料'
          },
          other_information: {
            contact_information: {
              phone: '03-1234-5678',
              email: 'info@hammer-shibuya.com',
              website: 'https://hammer-strength-shibuya.com'
            },
            special_programs: [
              '毎週土曜：パワーリフティング講習会',
              '月1回：栄養セミナー',
              '季節限定：ダイエットチャレンジ'
            ]
          }
        }

        setDetailFormData(testDetailData)
        console.log('DEBUG MODE: Test data injected:', testDetailData)

        setLoading(false)
        return
      }

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

        // 詳細情報を即座に読み込み
        loadGymDetailedInfo(firstGym.id, supabaseUser.id)

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
            '24hours': firstGym.business_hours?.is_24h || true,
            shower: firstGym.facilities?.shower || true,
            parking: firstGym.facilities?.parking || false,
            locker: firstGym.facilities?.locker || true,
            wifi: firstGym.facilities?.wifi || true,
            chalk: firstGym.facilities?.chalk || true,
            belt_rental: firstGym.facilities?.belt_rental || false,
            personal_training: firstGym.facilities?.personal_training || false,
            group_lesson: firstGym.facilities?.group_lesson || false,
            studio: firstGym.facilities?.studio || false,
            sauna: firstGym.facilities?.sauna || false,
            pool: firstGym.facilities?.pool || false,
            jacuzzi: firstGym.facilities?.jacuzzi || false,
            massage_chair: firstGym.facilities?.massage_chair || false,
            cafe: firstGym.facilities?.cafe || false,
            women_only: firstGym.facilities?.women_only || false,
            barrier_free: firstGym.facilities?.barrier_free || false,
            kids_room: firstGym.facilities?.kids_room || false,
            english_support: firstGym.facilities?.english_support || false,
            drop_in: firstGym.facilities?.drop_in || false
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

  const handleInputChange = (field: string, value: string) => {
    // 電話番号の自動フォーマット
    if (field === 'phone') {
      value = formatPhoneNumber(value)
    }

    // 画像URLの処理
    if (field === 'images') {
      const imageArray = value.split('\n').filter(url => url.trim())
      setFormData(prev => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          images: imageArray
        }
      }))

      // 画像URLのバリデーション
      if (imageArray.length > 10) {
        setFormErrors(prev => ({ ...prev, images: ERROR_MESSAGES.images.tooMany }))
      } else {
        const invalidImages = imageArray.filter(url => url && !validateImageUrl(url))
        if (invalidImages.length > 0) {
          setFormErrors(prev => ({ ...prev, images: ERROR_MESSAGES.images.invalid }))
        } else {
          setFormErrors(prev => ({ ...prev, images: '' }))
        }
      }
      return
    }

    setFormData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [field]: value
      }
    }))

    // リアルタイムバリデーション
    validateField(field, value)
  }

  const validateField = (field: string, value: string) => {
    let error = ''

    switch (field) {
      case 'phone':
        if (value && !validatePhoneNumber(value)) {
          error = ERROR_MESSAGES.phone.invalid
        }
        break
      case 'website':
        if (value && !validateUrl(value)) {
          error = ERROR_MESSAGES.website.invalid
        } else if (value.length > TEXT_LIMITS.url) {
          error = ERROR_MESSAGES.website.tooLong
        }
        break
      case 'name':
        if (value.length > TEXT_LIMITS.name) {
          error = ERROR_MESSAGES.name.tooLong
        }
        break
      case 'address':
        if (value.length > TEXT_LIMITS.address) {
          error = ERROR_MESSAGES.address.tooLong
        }
        break
      case 'description':
        if (value.length > TEXT_LIMITS.description) {
          error = ERROR_MESSAGES.description.tooLong
        }
        break
    }

    if (error) {
      setFormErrors(prev => ({ ...prev, [field]: error }))
    } else {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
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

  const handleSubmit = async () => {
    console.log('保存ボタンがクリックされました')
    console.log('selectedGym:', selectedGym)
    console.log('formData:', formData)

    if (!selectedGym) {
      console.log('selectedGymが選択されていません')
      alert('ジムが選択されていません')
      return
    }

    // フォーム全体のバリデーション
    const validation = validateGymForm(formData)
    if (!validation.isValid) {
      setFormErrors(validation.errors)
      alert('入力内容にエラーがあります。修正してください。')
      return
    }

    setBasicInfoSaving(true)

    try {
      const updates = {
        name: formData.basicInfo.name,
        city: formData.basicInfo.area,
        address: formData.basicInfo.address,
        business_hours: {
          weekday: formData.basicInfo.openingHours,
          is_24h: formData.services['24hours']
        },
        price_info: {
          monthly: formData.basicInfo.monthlyFee,
          visitor: formData.basicInfo.visitorFee
        },
        facilities: formData.services
      }

      console.log('updateGymBasicInfo を呼び出し中...', updates)
      const result = await updateGymBasicInfo(selectedGym.id, updates)
      console.log('保存結果:', result)
      alert('施設情報を保存しました')
    } catch (error) {
      console.error('Error saving gym info:', error)
      alert('保存に失敗しました: ' + (error as Error).message)
    } finally {
      setBasicInfoSaving(false)
    }
  }




  // ローディング中の表示
  if (loading) {
    return (
      <div className="min-h-screen bg-[rgba(254,255,250,0.97)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[color:var(--gt-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[color:var(--text-subtle)]">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgba(254,255,250,0.97)]">
      {/* ヘッダー */}
      <header className="bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-[73.5px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-[42px] h-[42px] bg-[rgba(245,177,143,0.1)] rounded-full flex items-center justify-center shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[21px] font-bold text-[color:var(--foreground)]">ジムトピア</h1>
              <p className="text-[12.108px] text-[color:var(--text-muted)]">理想のジムを見つけよう</p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="max-w-[1008px] mx-auto px-0 py-4 sm:py-6">
        <div className="bg-white">
          {/* ページヘッダー */}
          <div className="px-3.5 py-4 border-b border-[rgba(186,122,103,0.26)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[17.5px] text-[color:var(--text-muted)] mb-1">施設管理ページ</h2>
                <p className="text-[12.3px] text-[color:var(--text-muted)]">{selectedGym?.name || 'ハンマーストレングス渋谷'}</p>
                {/* デバッグ情報 */}
                <div className="text-[10px] text-gray-500 mt-1">
                  Debug: User: {user?.email} | HasAccess: {hasAccess.toString()} | SelectedGym: {selectedGym?.id} | ManagedGyms: {managedGyms.length}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {gyms.length > 1 && (
                  <select
                    className="text-[12.3px] px-2 py-1 border border-[rgba(186,122,103,0.26)] rounded-md"
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
                    {gyms.map((gym, index) => (
                      <option key={`${gym.id}-${index}`} value={gym.id}>{gym.name}</option>
                    ))}
                  </select>
                )}
                <div className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-[color:var(--gt-primary)]" />
                  <span className="text-[12.3px] text-[color:var(--text-muted)]">{stats?.likesCount || 342} イキタイ</span>
                </div>
              </div>
            </div>
          </div>

          {/* タブ */}
          <div className="px-[21px] pt-[28px]">
            <div className="bg-[rgba(254,255,250,0.97)] rounded-[14.5px] p-[3px] flex gap-0">
              <button
                onClick={() => setActiveTab('basic')}
                className={`flex-1 px-4 py-2 rounded-[14.5px] text-[12.3px] font-medium transition-all ${
                  activeTab === 'basic'
                    ? 'bg-white text-[color:var(--foreground)] shadow-sm'
                    : 'text-[color:var(--foreground)] hover:text-[color:var(--text-subtle)]'
                }`}
              >
                基本情報
              </button>
              <button
                onClick={() => setActiveTab('facility')}
                className={`flex-1 px-4 py-2 rounded-[14.5px] text-[12.3px] font-medium transition-all ${
                  activeTab === 'facility'
                    ? 'bg-white text-[color:var(--foreground)] shadow-sm'
                    : 'text-[color:var(--foreground)] hover:text-[color:var(--text-subtle)]'
                }`}
              >
                設備管理
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 px-4 py-2 rounded-[14.5px] text-[12.3px] font-medium transition-all ${
                  activeTab === 'details'
                    ? 'bg-white text-[color:var(--foreground)] shadow-sm'
                    : 'text-[color:var(--foreground)] hover:text-[color:var(--text-subtle)]'
                }`}
              >
                詳細情報
              </button>
            </div>
          </div>

          {/* フォームパネル */}
          <div className="px-[21px] pt-[28px] pb-[21px]">
            {activeTab === 'basic' && (
              <div className="bg-white border border-[rgba(186,122,103,0.26)] rounded-[14.5px] p-[22px]">
                {/* 基本情報 */}
                <div className="mb-6">
                  <h3 className="text-[14px] font-bold text-[color:var(--foreground)] mb-4">基本情報</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12.3px] text-[color:var(--foreground)] mb-2">
                        施設名
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-[rgba(254,255,250,0.95)] border border-[rgba(186,122,103,0.26)] rounded-[8.5px] text-[12.3px] text-[color:var(--foreground)] focus:ring-2 focus:ring-[var(--gt-primary)] focus:border-transparent"
                        value={formData.basicInfo.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[12.3px] text-[color:var(--foreground)] mb-2">
                        エリア
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-[rgba(254,255,250,0.95)] border border-[rgba(186,122,103,0.26)] rounded-[8.5px] text-[12.3px] text-[color:var(--foreground)] focus:ring-2 focus:ring-[var(--gt-primary)] focus:border-transparent"
                        value={formData.basicInfo.area}
                        onChange={(e) => handleInputChange('area', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12.3px] text-[color:var(--foreground)] mb-2">
                      住所
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-[rgba(254,255,250,0.95)] border border-[rgba(186,122,103,0.26)] rounded-[8.5px] text-[12.3px] text-[color:var(--foreground)] focus:ring-2 focus:ring-[var(--gt-primary)] focus:border-transparent"
                      value={formData.basicInfo.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12.3px] text-[color:var(--foreground)] mb-2">
                        営業時間
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-[rgba(254,255,250,0.95)] border border-[rgba(186,122,103,0.26)] rounded-[8.5px] text-[12.3px] text-[color:var(--foreground)] focus:ring-2 focus:ring-[var(--gt-primary)] focus:border-transparent"
                        value={formData.basicInfo.openingHours}
                        onChange={(e) => handleInputChange('openingHours', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[12.108px] text-[color:var(--foreground)] mb-2">
                        月額料金 (円)
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-[rgba(254,255,250,0.95)] border border-[rgba(186,122,103,0.26)] rounded-[8.5px] text-[12.3px] text-[color:var(--foreground)] focus:ring-2 focus:ring-[var(--gt-primary)] focus:border-transparent"
                        value={formData.basicInfo.monthlyFee}
                        onChange={(e) => handleInputChange('monthlyFee', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12.108px] text-[color:var(--foreground)] mb-2">
                        ビジター料金 (円)
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-[rgba(254,255,250,0.95)] border border-[rgba(186,122,103,0.26)] rounded-[8.5px] text-[12.3px] text-[color:var(--foreground)] focus:ring-2 focus:ring-[var(--gt-primary)] focus:border-transparent"
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
                <h3 className="text-[14px] font-bold text-[color:var(--foreground)] mb-4">施設・サービス</h3>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: '24hours', label: '24時間営業' },
                    { key: 'shower', label: 'シャワー' },
                    { key: 'parking', label: '駐車場' },
                    { key: 'locker', label: 'ロッカー' },
                    { key: 'wifi', label: 'Wi-Fi' },
                    { key: 'chalk', label: 'チョーク利用可' },
                    { key: 'belt_rental', label: 'ベルト貸出' },
                    { key: 'personal_training', label: 'パーソナル' },
                    { key: 'group_lesson', label: 'グループレッスン' },
                    { key: 'studio', label: 'スタジオ' },
                    { key: 'sauna', label: 'サウナ' },
                    { key: 'pool', label: 'プール' },
                    { key: 'jacuzzi', label: 'ジャグジー' },
                    { key: 'massage_chair', label: 'マッサージチェア' },
                    { key: 'cafe', label: 'カフェ/売店' },
                    { key: 'women_only', label: '女性専用エリア' },
                    { key: 'barrier_free', label: 'バリアフリー' },
                    { key: 'kids_room', label: 'キッズルーム' },
                    { key: 'english_support', label: '英語対応' },
                    { key: 'drop_in', label: 'ドロップイン' }
                  ].map((service) => (
                    <div key={service.key} className="flex items-center justify-between p-3 bg-[rgba(254,255,250,0.97)] rounded-lg border border-[rgba(186,122,103,0.26)]">
                      <span className="text-sm font-medium text-[color:var(--foreground)]">{service.label}</span>
                      <button
                        type="button"
                        onClick={() => handleServiceToggle(service.key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] focus:ring-offset-2 ${
                          formData.services[service.key as keyof typeof formData.services] ? 'bg-[color:var(--gt-primary)]' : 'bg-[rgba(254,255,250,0.82)]'
                        }`}
                      >
                        <span className="sr-only">
                          {formData.services[service.key as keyof typeof formData.services] ? 'オフにする' : 'オンにする'}
                        </span>
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            formData.services[service.key as keyof typeof formData.services] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

                {/* 保存ボタン */}
                <button
                  onClick={handleSubmit}
                  disabled={basicInfoSaving}
                  className={`w-full px-6 py-3 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2 ${
                    basicInfoSaving
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[color:var(--gt-primary)] hover:bg-[color:var(--gt-primary-strong)]'
                  }`}
                >
                  {basicInfoSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      基本情報を保存
                    </>
                  )}
                </button>
              </div>
            )}

            {/* 設備管理タブ */}
            {activeTab === 'facility' && (
              <FacilitySection
                equipmentList={equipmentList}
                onUpdateEquipmentList={setEquipmentList}
                gymId={selectedGym?.id}
              />
            )}

            {/* 詳細情報管理タブ */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* ヘッダーと保存ボタン */}
                <div className="flex justify-between items-center">
                  <h3 className="text-[14px] font-bold text-[color:var(--foreground)]">詳細情報管理</h3>
                  <button
                    onClick={handleDetailFormSave}
                    disabled={detailFormSaving || !selectedGym}
                    className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 text-[12.3px] ${
                      detailFormSaving || !selectedGym
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[color:var(--gt-primary)] text-white hover:bg-[color:var(--gt-primary-strong)]'
                    }`}
                  >
                    {detailFormSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        保存する
                      </>
                    )}
                  </button>
                </div>

                {detailFormLoading ? (
                  <div className="bg-white border border-[rgba(186,122,103,0.26)] rounded-[14.5px] p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[color:var(--gt-primary)] mx-auto mb-4" />
                    <p className="text-[color:var(--text-muted)]">読み込み中...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* セクション選択サイドバー */}
                    <div className="lg:col-span-1">
                      <div className="bg-white border border-[rgba(186,122,103,0.26)] rounded-[14.5px] p-4 sticky top-24">
                        <h4 className="text-[12.3px] font-bold text-[color:var(--foreground)] mb-3">セクション</h4>
                        <nav className="space-y-1">
                          {[
                            { id: 'pricing', title: '料金体系', icon: '💰' },
                            { id: 'hours', title: '営業時間', icon: '🕐' },
                            { id: 'rules', title: 'ルール・規定', icon: '📋' },
                            { id: 'beginner', title: '初心者サポート', icon: '👥' },
                            { id: 'access', title: 'アクセス', icon: '🚗' },
                            { id: 'other', title: 'その他', icon: 'ℹ️' }
                          ].map((section) => (
                            <button
                              key={section.id}
                              onClick={() => setActiveDetailSection(section.id)}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12.3px] font-medium transition-colors ${
                                activeDetailSection === section.id
                                  ? 'bg-[rgba(231,103,76,0.08)] text-[color:var(--gt-secondary-strong)]'
                                  : 'text-[color:var(--text-muted)] hover:bg-[rgba(254,255,250,0.98)]'
                              }`}
                            >
                              <span>{section.icon}</span>
                              {section.title}
                            </button>
                          ))}
                        </nav>
                      </div>
                    </div>

                    {/* メインコンテンツエリア */}
                    <div className="lg:col-span-3">
                      <div className="bg-white border border-[rgba(186,122,103,0.26)] rounded-[14.5px] p-6">
                        {/* デバッグ情報表示 */}
                        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
                          <h4 className="text-sm font-bold text-yellow-800 mb-2">デバッグ情報</h4>
                          <div className="text-xs text-yellow-700">
                            <p><strong>AuthUser:</strong> {authUser ? `${authUser.email} (${authUser.id})` : '未設定'}</p>
                            <p><strong>SelectedGym:</strong> {selectedGym ? selectedGym.name : '未選択'}</p>
                            <p><strong>DetailFormData Keys:</strong> {Object.keys(detailFormData).join(', ')}</p>
                            <p><strong>PricingSystem:</strong> {detailFormData.pricing_system ?
                              `プラン数:${detailFormData.pricing_system.membership_plans?.length || 0}` : '未設定'}</p>
                            <p><strong>Loading:</strong> {detailFormLoading ? 'はい' : 'いいえ'}</p>
                          </div>
                        </div>

                        {activeDetailSection === 'pricing' && (
                          <div>
                            <h5 className="text-lg font-bold text-[color:var(--foreground)] mb-6 flex items-center gap-3">
                              <span>💰</span>
                              料金体系
                            </h5>
                            <PricingSection
                              data={detailFormData.pricing_system || {}}
                              onChange={(data) => updateDetailFormSection('pricing_system', data)}
                            />
                          </div>
                        )}

                        {activeDetailSection === 'hours' && (
                          <div>
                            <h5 className="text-lg font-bold text-[color:var(--foreground)] mb-6 flex items-center gap-3">
                              <span>🕐</span>
                              営業時間
                            </h5>
                            <OperatingHoursSection
                              data={detailFormData.operating_hours || {}}
                              onChange={(data) => updateDetailFormSection('operating_hours', data)}
                            />
                          </div>
                        )}

                        {activeDetailSection === 'rules' && (
                          <div>
                            <h5 className="text-lg font-bold text-[color:var(--foreground)] mb-6 flex items-center gap-3">
                              <span>📋</span>
                              ルール・規定
                            </h5>
                            <RulesSection
                              data={detailFormData.rules_and_policies || {}}
                              onChange={(data) => updateDetailFormSection('rules_and_policies', data)}
                            />
                          </div>
                        )}

                        {activeDetailSection === 'beginner' && (
                          <div>
                            <h5 className="text-lg font-bold text-[color:var(--foreground)] mb-6 flex items-center gap-3">
                              <span>👥</span>
                              初心者サポート
                            </h5>
                            <BeginnerSupportSection
                              data={detailFormData.beginner_support || {}}
                              onChange={(data) => updateDetailFormSection('beginner_support', data)}
                            />
                          </div>
                        )}

                        {activeDetailSection === 'access' && (
                          <div>
                            <h5 className="text-lg font-bold text-[color:var(--foreground)] mb-6 flex items-center gap-3">
                              <span>🚗</span>
                              アクセス
                            </h5>
                            <AccessInfoSection
                              data={detailFormData.access_information || {}}
                              onChange={(data) => updateDetailFormSection('access_information', data)}
                            />
                          </div>
                        )}

                        {activeDetailSection === 'other' && (
                          <div>
                            <h5 className="text-lg font-bold text-[color:var(--foreground)] mb-6 flex items-center gap-3">
                              <span>ℹ️</span>
                              その他
                            </h5>
                            <OtherInfoSection
                              data={detailFormData.other_information || {}}
                              onChange={(data) => updateDetailFormSection('other_information', data)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}