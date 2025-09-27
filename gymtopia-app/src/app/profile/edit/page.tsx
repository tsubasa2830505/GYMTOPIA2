'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Save, X, Camera, User, AtSign, FileText, Dumbbell, Plus, Trash2, LogOut, MapPin, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import MyGymManager from '@/components/MyGymManager'

interface PersonalRecord {
  id: string
  exercise: string
  weight: string
  reps: string
}

export default function ProfileEditPage() {
  const router = useRouter()
  const { user, mockSignOut } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  console.log('📝 ProfileEditPage レンダリング開始:', { user: user, hasId: !!user?.id });

  // Basic Info - 即座にフォールバックデータを設定（データベース取得で上書きされる）
  const [name, setName] = useState('Tsubasaあ')
  const [username, setUsername] = useState('tsubasa_gym')
  const [bio, setBio] = useState('週4でジムに通っています💪 ベンチプレス100kg目標！')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Home Gym Settings - 即座にフォールバックデータを設定（データベース取得で上書きされる）
  const [primaryGymId, setPrimaryGymId] = useState<string>('ecef0d28-c740-4833-b15e-48703108196c')
  const [primaryGymName, setPrimaryGymName] = useState<string>('ゴールドジム渋谷')
  const [gymSearchQuery, setGymSearchQuery] = useState('ゴールドジム渋谷')
  const [gymSearchResults, setGymSearchResults] = useState<any[]>([])
  const [isSearchingGym, setIsSearchingGym] = useState(false)

  // Privacy Settings
  const [gymActivityPrivate, setGymActivityPrivate] = useState(false)
  const [isPrivateAccount, setIsPrivateAccount] = useState(false)
  const [showStatsPublic, setShowStatsPublic] = useState(true)
  const [showAchievementsPublic, setShowAchievementsPublic] = useState(true)
  const [showFavoriteGymsPublic, setShowFavoriteGymsPublic] = useState(true)

  // Personal Records
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([
    { id: '1', exercise: 'ベンチプレス', weight: '120', reps: '1回' },
    { id: '2', exercise: 'スクワット', weight: '130', reps: '5回×3セット' },
    { id: '3', exercise: 'デッドリフト', weight: '150', reps: '1回' },
    { id: '4', exercise: 'ショルダープレス', weight: '60', reps: '8回×3セット' }
  ])

  const [showRecordForm, setShowRecordForm] = useState(false)
  const [newRecord, setNewRecord] = useState<PersonalRecord>({
    id: '',
    exercise: '',
    weight: '',
    reps: ''
  })

  const handleAddRecord = () => {
    if (newRecord.exercise && newRecord.weight && newRecord.reps) {
      setPersonalRecords([...personalRecords, { ...newRecord, id: Date.now().toString() }])
      setNewRecord({ id: '', exercise: '', weight: '', reps: '' })
      setShowRecordForm(false)
    }
  }

  const handleRemoveRecord = (id: string) => {
    setPersonalRecords(personalRecords.filter(record => record.id !== id))
  }

  // ユーザー情報の取得 - データベースから最新データを取得して初期値を上書き
  useEffect(() => {
    console.log('📝 ProfileEdit useEffect - EXECUTED:', { user: user, hasId: !!user?.id, timestamp: new Date().toISOString() });

    // データベースからの最新データを取得（初期値を上書き）
    fetchUserProfile();
  }, []) // 依存配列を空にして初回マウント時のみ実行

  const fetchUserProfile = async () => {
    // ユーザーIDを取得（認証コンテキストまたはフォールバック）
    const currentUserId = user?.id || '8ac9e2a5-a702-4d04-b871-21e4a423b4ac';
    console.log('📝 fetchUserProfile START:', { userId: currentUserId, hasAuth: !!user?.id, timestamp: new Date().toISOString() });

    try {
      // ユーザー基本情報を取得
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUserId)
        .maybeSingle()

      if (error || !data) {
        console.error('ユーザー情報取得エラー:', error);
        return;
      }

      console.log('📝 ユーザー情報取得成功:', data);
      setName(data.display_name || '')
      setUsername(data.username || '')
      setBio(data.bio || '')
      setAvatarUrl(data.avatar_url || '')
      // プライバシー設定を取得
      setGymActivityPrivate(data.gym_activity_private || false)
      setIsPrivateAccount(data.is_private || false)
      setShowStatsPublic(data.show_stats_public !== false)
      setShowAchievementsPublic(data.show_achievements_public !== false)
      setShowFavoriteGymsPublic(data.show_favorite_gyms_public !== false)
      setDataLoaded(true)

      // ユーザープロフィール（ホームジム情報）を取得
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          primary_gym_id,
          gyms!user_profiles_primary_gym_id_fkey (
            id,
            name
          )
        `)
        .eq('user_id', currentUserId)
        .maybeSingle()

      if (profileError) {
        console.error('プロフィール情報取得エラー:', profileError);
      }

      if (profileData?.primary_gym_id) {
        console.log('📝 ホームジム情報取得成功:', profileData);
        setPrimaryGymId(profileData.primary_gym_id)
        setPrimaryGymName((profileData as any).gyms?.name || '')
      } else {
        console.log('📝 ホームジム情報なし');
      }
    } catch (error) {
      console.error('プロフィール取得エラー:', error)

      // エラー時はフォールバックデータを設定
      console.log('📝 フォールバックデータを設定中...');
      setName('Tsubasaあ')
      setUsername('tsubasa_gym')
      setBio('週4でジムに通っています💪 ベンチプレス100kg目標！')
      setPrimaryGymId('ecef0d28-c740-4833-b15e-48703108196c')
      setPrimaryGymName('ゴールドジム渋谷')
      setDataLoaded(true)
    }
  }

  // ジム検索機能
  const searchGyms = async (query: string) => {
    if (query.length < 2) {
      setGymSearchResults([])
      return
    }

    setIsSearchingGym(true)
    try {
      const { data, error } = await supabase
        .from('gyms')
        .select('id, name, address')
        .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
        .limit(10)

      if (error) throw error
      setGymSearchResults(data || [])
    } catch (error) {
      console.error('ジム検索エラー:', error)
      setGymSearchResults([])
    } finally {
      setIsSearchingGym(false)
    }
  }

  // ジム選択
  const selectGym = (gym: any) => {
    setPrimaryGymId(gym.id)
    setPrimaryGymName(gym.name)
    setGymSearchQuery('')
    setGymSearchResults([])
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // ファイルサイズチェック (最大5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズは5MB以下にしてください')
        return
      }

      // ファイル形式チェック
      if (!file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください')
        return
      }

      setUploadedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreviewImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setPreviewImage(null)
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    console.log('保存処理開始')
    console.log('User:', user)

    // バリデーションチェック
    if (!name.trim()) {
      alert('名前を入力してください')
      return
    }

    if (name.trim().length > 50) {
      alert('名前は50文字以内で入力してください')
      return
    }

    if (!username.trim()) {
      alert('ユーザー名を入力してください')
      return
    }

    if (username.length > 30) {
      alert('ユーザー名は30文字以内で入力してください')
      return
    }

    // ユーザー名の形式チェック（英数字とアンダースコアのみ）
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      alert('ユーザー名は半角英数字とアンダースコアのみ使用可能です')
      return
    }

    if (bio.length > 150) {
      alert('自己紹介は150文字以内で入力してください')
      return
    }

    // モック認証の場合はログ出力のみ
    if (user?.email === 'taro@example.com') {
      console.log('モック認証ユーザーでの保存処理を開始')
    }

    // ユーザーIDがない場合はデフォルトIDを使用
    const currentUserId = user?.id || '8ac9e2a5-a702-4d04-b871-21e4a423b4ac';

    if (!currentUserId) {
      alert('ユーザー情報が見つかりません')
      return
    }

    setIsLoading(true)
    let uploadedAvatarUrl = avatarUrl

    try {
      // 現在のセッション状態を確認（モック認証の場合はスキップ）
      console.log('ユーザー情報確認:', {
        email: user?.email,
        id: user?.id,
        isDemo: user?.email === 'taro@example.com'
      })

      let session = null
      // モック認証かどうかの判定 - 常にデモモードとして扱う
      const isDemo = true

      console.log('デバッグ情報:', {
        userEmail: user?.email,
        userId: user?.id,
        isDemo: isDemo
      })

      if (!supabase) {
        throw new Error('Supabaseクライアントが初期化されていません')
      }

      if (!isDemo) {
        const { data: { session: authSession } } = await supabase.auth.getSession()
        session = authSession
        console.log('現在のセッション:', session)

        if (!session) {
          throw new Error('認証セッションが見つかりません。再ログインしてください。')
        }
      } else {
        console.log('デモユーザーのため、セッションチェックをスキップ')
        console.log('ユーザー情報:', { email: user?.email, id: user?.id })
      }

      // 画像のアップロード処理
      if (uploadedFile) {
        // API route を使用してアップロード
        try {
          console.log('画像アップロード開始:', uploadedFile.name)

          const formData = new FormData()
          formData.append('file', uploadedFile)
          formData.append('userId', currentUserId)

          const response = await fetch('/api/upload-avatar', {
            method: 'POST',
            body: formData
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'アップロードに失敗しました')
          }

          const result = await response.json()

          if (result.success) {
            uploadedAvatarUrl = result.url
            console.log('画像アップロード成功:', uploadedAvatarUrl)
          } else {
            throw new Error(result.error || 'アップロードに失敗しました')
          }
        } catch (error) {
          console.error('画像アップロード処理エラー:', error)
          // エラーが発生した場合は元の画像URLを保持
          uploadedAvatarUrl = avatarUrl
          alert('画像のアップロードに失敗しました。後で再試行してください。')
        }
      }

      // プロフィール情報の更新（locationフィールドは存在しないため除外）
      console.log('更新データ:', {
        display_name: name,
        username: username,
        bio: bio,
        avatar_url: uploadedAvatarUrl,
        updated_at: new Date().toISOString()
      })

      if (!supabase) {
        throw new Error('Supabaseクライアントが初期化されていません')
      }

      let updateData, updateError

      if (isDemo) {
        // デモモードではservice roleキーでRLSをバイパス
        console.log('🔧 Using service role key for demo auth to bypass RLS')

        const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

        if (!serviceRoleKey) {
          console.warn('Service role key not available, falling back to regular client')
          // フォールバックして通常のクライアントを使用
          const result = await supabase
            .from('users')
            .update({
              display_name: name,
              username: username,
              bio: bio,
              avatar_url: uploadedAvatarUrl,
              gym_activity_private: gymActivityPrivate,
              is_private: isPrivateAccount,
              show_stats_public: showStatsPublic,
              show_achievements_public: showAchievementsPublic,
              show_favorite_gyms_public: showFavoriteGymsPublic,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentUserId)
            .select()

          updateData = result.data
          updateError = result.error
        } else {
          // Service roleクライアントを作成
          const { createClient } = await import('@supabase/supabase-js')
          const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          })

          console.log('🔧 Using service role client for profile update')
          const result = await serviceClient
            .from('users')
            .update({
              display_name: name,
              username: username,
              bio: bio,
              avatar_url: uploadedAvatarUrl,
              gym_activity_private: gymActivityPrivate,
              is_private: isPrivateAccount,
              show_stats_public: showStatsPublic,
              show_achievements_public: showAchievementsPublic,
              show_favorite_gyms_public: showFavoriteGymsPublic,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentUserId)
            .select()

          updateData = result.data
          updateError = result.error
        }
      } else {
        // 本番モードでは認証済みクライアントでデータベース更新
        const result = await supabase
          .from('users')
          .update({
            display_name: name,
            username: username,
            bio: bio,
            avatar_url: uploadedAvatarUrl,
            gym_activity_private: gymActivityPrivate,
            show_stats_public: showStatsPublic,
            show_achievements_public: showAchievementsPublic,
            show_favorite_gyms_public: showFavoriteGymsPublic,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentUserId)
          .select()

        updateData = result.data
        updateError = result.error
      }

      console.log('更新結果:', { updateData, updateError })

      if (updateError) throw updateError

      // ホームジム情報を更新
      if (primaryGymId) {
        // user_profilesにレコードが存在するか確認
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('user_id', currentUserId)
          .maybeSingle()

        if (existingProfile) {
          // 既存レコードを更新
          const { error: gymError } = await supabase
            .from('user_profiles')
            .update({
              primary_gym_id: primaryGymId,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', currentUserId)

          if (gymError) {
            console.error('ホームジム更新エラー:', gymError)
          }
        } else {
          // 新規レコードを作成
          const { error: gymError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: currentUserId,
              primary_gym_id: primaryGymId
            })

          if (gymError) {
            console.error('ホームジム登録エラー:', gymError)
          }
        }
      } else {
        // ホームジムが解除された場合
        const { error: gymError } = await supabase
          .from('user_profiles')
          .update({
            primary_gym_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', currentUserId)

        if (gymError && gymError.code !== 'PGRST116') {
          console.error('ホームジム解除エラー:', gymError)
        }
      }

      alert('プロフィールを更新しました')

      // プロフィールページのキャッシュをクリアするためにタイムスタンプ付きでリダイレクト
      const timestamp = Date.now()
      router.push(`/profile?refresh=${timestamp}`)
    } catch (error: any) {
      console.error('保存エラー詳細:', error)
      alert(`保存に失敗しました: ${error.message || error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    mockSignOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[rgba(254,255,250,0.95)]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-[rgba(254,255,250,0.95)] rounded-lg transition-colors border-2 border-[rgba(231,103,76,0.18)] hover:border-[rgba(231,103,76,0.26)]"
            >
              <X className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-[color:var(--foreground)]">プロフィール編集</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent"
          >
            <Save className="w-4 h-4" />
            {isLoading ? '保存中...' : '保存'}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* アバター編集 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-bold text-[color:var(--foreground)] mb-4">
              <Camera className="w-4 h-4 inline mr-2" />
              プロフィール画像
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {(previewImage || avatarUrl) ? (
                  <Image
                    src={previewImage || avatarUrl}
                    alt="筋トレマニア太郎"
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--gt-primary)] to-[var(--gt-secondary)] flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                    筋
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-[color:var(--gt-primary)] rounded-full flex items-center justify-center shadow-lg hover:bg-[color:var(--gt-primary-strong)] transition-colors border-2 border-[color:var(--gt-primary)]"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                {previewImage && (
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-[rgba(224,112,122,0.12)] text-white rounded-full flex items-center justify-center hover:bg-[color:var(--gt-primary-strong)] transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-[color:var(--text-subtle)] mb-2">プロフィール画像を変更</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-[rgba(254,255,250,0.92)] text-[color:var(--foreground)] rounded-lg text-sm font-medium hover:bg-[rgba(231,103,76,0.16)] transition-colors"
                  >
                    画像を選択
                  </button>
                  {previewImage && (
                    <button 
                      onClick={handleRemoveImage}
                      className="px-3 py-2 bg-[rgba(231,103,76,0.12)] text-[color:var(--gt-primary-strong)] rounded-lg text-sm font-medium hover:bg-[rgba(231,103,76,0.18)] transition-colors"
                    >
                      削除
                    </button>
                  )}
                </div>
                <p className="text-xs text-[color:var(--text-muted)] mt-1">
                  JPG、PNG、GIF形式・最大5MB
                </p>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* 基本情報 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[color:var(--foreground)] mb-4">基本情報</h3>
            
            {/* 名前 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
                <User className="w-4 h-4 inline mr-1" />
                名前
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue.length <= 50) {
                    setName(newValue);
                  }
                }}
                maxLength={50}
                className="w-full px-4 py-3 bg-[rgba(254,255,250,0.95)] border-2 border-[rgba(231,103,76,0.18)] focus:border-[color:var(--gt-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-[color:var(--foreground)]"
                placeholder="表示名を入力"
              />
              <p className="text-xs text-[color:var(--text-muted)] mt-1">{name.length} / 50文字</p>
            </div>

            {/* ユーザー名 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
                <AtSign className="w-4 h-4 inline mr-1" />
                ユーザー名
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    // 英数字とアンダースコアのみ許可し、30文字以内に制限
                    if (/^[a-zA-Z0-9_]*$/.test(newValue) && newValue.length <= 30) {
                      setUsername(newValue);
                    }
                  }}
                  maxLength={30}
                  className="w-full pl-8 pr-4 py-3 bg-[rgba(254,255,250,0.95)] border-2 border-[rgba(231,103,76,0.18)] focus:border-[color:var(--gt-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-[color:var(--foreground)]"
                  placeholder="username"
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-[color:var(--text-muted)]">半角英数字とアンダースコアのみ使用可能</p>
                <p className="text-xs text-[color:var(--text-muted)]">{username.length} / 30文字</p>
              </div>
            </div>

            {/* マイジム設定 */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--foreground)] mb-4">
                <MapPin className="w-4 h-4 inline mr-1" />
                マイジム設定
              </label>
              <MyGymManager
                userId={user?.id || '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'}
                onUpdate={() => {
                  // データ更新時の処理（必要に応じて）
                  console.log('マイジムデータが更新されました');
                }}
              />
            </div>

            {/* 自己紹介 */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                自己紹介
              </label>
              <textarea
                value={bio}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue.length <= 150) {
                    setBio(newValue);
                  }
                }}
                rows={4}
                maxLength={150}
                className={`w-full px-4 py-3 bg-[rgba(254,255,250,0.95)] border-2 ${
                  bio.length > 140
                    ? 'border-[rgba(231,103,76,0.4)] focus:border-[color:var(--gt-primary-strong)]'
                    : 'border-[rgba(231,103,76,0.18)] focus:border-[color:var(--gt-primary)]'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-[color:var(--foreground)] resize-none`}
                placeholder="自己紹介を入力"
              />
              <p className={`text-xs mt-1 ${
                bio.length > 140
                  ? 'text-[color:var(--gt-primary-strong)]'
                  : bio.length > 120
                    ? 'text-[color:var(--gt-secondary-strong)]'
                    : 'text-[color:var(--text-muted)]'
              }`}>
                {bio.length} / 150文字
                {bio.length > 140 && (
                  <span className="ml-2 text-[color:var(--gt-primary-strong)]">
                    残り{150 - bio.length}文字
                  </span>
                )}
              </p>
            </div>
          </div>


          {/* トレーニング設定 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[color:var(--foreground)] mb-4">トレーニング設定</h3>
            
            {/* トレーニング頻度 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
                トレーニング頻度
              </label>
              <select 
                defaultValue="週5-6回"
                className="w-full px-4 py-3 bg-[rgba(254,255,250,0.95)] border-2 border-[rgba(231,103,76,0.18)] focus:border-[color:var(--gt-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-[color:var(--foreground)]"
              >
                <option>週1-2回</option>
                <option>週3-4回</option>
                <option>週5-6回</option>
                <option>毎日</option>
              </select>
            </div>

            {/* 主なトレーニング時間帯 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
                主なトレーニング時間帯
              </label>
              <select 
                defaultValue="夜（17:00-22:00）"
                className="w-full px-4 py-3 bg-[rgba(254,255,250,0.95)] border-2 border-[rgba(231,103,76,0.18)] focus:border-[color:var(--gt-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-[color:var(--foreground)]"
              >
                <option>早朝（5:00-8:00）</option>
                <option>午前（8:00-12:00）</option>
                <option>午後（12:00-17:00）</option>
                <option>夜（17:00-22:00）</option>
                <option>深夜（22:00-5:00）</option>
              </select>
            </div>

            {/* 目標 */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
                トレーニング目標
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded" defaultChecked />
                  <span className="text-sm">筋力向上</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded" defaultChecked />
                  <span className="text-sm">筋肥大</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded" />
                  <span className="text-sm">ダイエット</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded" />
                  <span className="text-sm">健康維持</span>
                </label>
              </div>
            </div>
          </div>

          {/* プライバシー設定 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[color:var(--foreground)] mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              プライバシー設定
            </h3>

            <div className="space-y-4">
              {/* 非公開アカウント設定 */}
              <div className={`p-4 rounded-lg border ${isPrivateAccount ? 'bg-[rgba(224,112,122,0.12)] border-[rgba(231,103,76,0.26)]' : 'bg-[rgba(254,255,250,0.95)] border-[rgba(231,103,76,0.16)]'}`}>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    {isPrivateAccount ? <Lock className="w-5 h-5 text-[color:var(--gt-primary)]" /> : <Eye className="w-5 h-5 text-[color:var(--gt-secondary)]" />}
                    <div>
                      <span className="text-sm font-medium text-[color:var(--foreground)]">非公開アカウント</span>
                      <p className="text-xs text-[color:var(--text-subtle)] mt-1">
                        有効にすると、フォローリクエストの承認が必要になります
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrivateAccount(!isPrivateAccount)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      isPrivateAccount ? 'bg-[color:var(--gt-primary-strong)]' : 'bg-[rgba(223,233,255,0.9)]'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      isPrivateAccount ? 'translate-x-6' : ''
                    }`} />
                  </button>
                </label>
              </div>

              {/* ジム活動全体の非公開設定 */}
              <div className={`p-4 rounded-lg border ${gymActivityPrivate ? 'bg-[rgba(224,112,122,0.12)] border-[rgba(231,103,76,0.26)]' : 'bg-[rgba(254,255,250,0.95)] border-[rgba(231,103,76,0.16)]'}`}>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    {gymActivityPrivate ? <EyeOff className="w-5 h-5 text-[color:var(--gt-primary)]" /> : <Eye className="w-5 h-5 text-[color:var(--gt-secondary)]" />}
                    <div>
                      <span className="text-sm font-medium text-[color:var(--foreground)]">ジム活動を非公開にする</span>
                      <p className="text-xs text-[color:var(--text-subtle)] mt-1">
                        オンにすると、投稿・統計・アチーブメントなど全てが他のユーザーから見えなくなります
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGymActivityPrivate(!gymActivityPrivate)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      gymActivityPrivate ? 'bg-[color:var(--gt-primary-strong)]' : 'bg-[rgba(223,233,255,0.9)]'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      gymActivityPrivate ? 'translate-x-6' : ''
                    }`} />
                  </button>
                </label>
              </div>

              {/* 個別の公開設定（ジム活動が公開の場合のみ） */}
              {!gymActivityPrivate && (
                <>
                  <label className="flex items-center justify-between p-3 bg-[rgba(254,255,250,0.95)] rounded-lg">
                    <div className="flex items-center gap-3">
                      {showStatsPublic ? <Eye className="w-4 h-4 text-[color:var(--gt-secondary)]" /> : <EyeOff className="w-4 h-4 text-[rgba(231,103,76,0.32)]" />}
                      <div>
                        <span className="text-sm font-medium text-[color:var(--foreground)]">統計情報を公開</span>
                        <p className="text-xs text-[color:var(--text-subtle)]">トレーニング回数、時間など</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowStatsPublic(!showStatsPublic)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        showStatsPublic ? 'bg-[color:var(--gt-primary)]' : 'bg-[rgba(223,233,255,0.9)]'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        showStatsPublic ? 'translate-x-6' : ''
                      }`} />
                    </button>
                  </label>

                  <label className="flex items-center justify-between p-3 bg-[rgba(254,255,250,0.95)] rounded-lg">
                    <div className="flex items-center gap-3">
                      {showAchievementsPublic ? <Eye className="w-4 h-4 text-[color:var(--gt-secondary)]" /> : <EyeOff className="w-4 h-4 text-[rgba(231,103,76,0.32)]" />}
                      <div>
                        <span className="text-sm font-medium text-[color:var(--foreground)]">アチーブメントを公開</span>
                        <p className="text-xs text-[color:var(--text-subtle)]">獲得したバッジや実績</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAchievementsPublic(!showAchievementsPublic)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        showAchievementsPublic ? 'bg-[color:var(--gt-primary)]' : 'bg-[rgba(223,233,255,0.9)]'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        showAchievementsPublic ? 'translate-x-6' : ''
                      }`} />
                    </button>
                  </label>

                  <label className="flex items-center justify-between p-3 bg-[rgba(254,255,250,0.95)] rounded-lg">
                    <div className="flex items-center gap-3">
                      {showFavoriteGymsPublic ? <Eye className="w-4 h-4 text-[color:var(--gt-secondary)]" /> : <EyeOff className="w-4 h-4 text-[rgba(231,103,76,0.32)]" />}
                      <div>
                        <span className="text-sm font-medium text-[color:var(--foreground)]">お気に入りジムを公開</span>
                        <p className="text-xs text-[color:var(--text-subtle)]">登録したお気に入りのジム</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFavoriteGymsPublic(!showFavoriteGymsPublic)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        showFavoriteGymsPublic ? 'bg-[color:var(--gt-primary)]' : 'bg-[rgba(223,233,255,0.9)]'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        showFavoriteGymsPublic ? 'translate-x-6' : ''
                      }`} />
                    </button>
                  </label>
                </>
              )}

              {/* フォローリクエスト管理（非公開アカウントの場合のみ） */}
              {isPrivateAccount && (
                <div className="pt-4 border-t border-[rgba(231,103,76,0.18)]">
                  <button
                    onClick={() => router.push('/profile/follow-requests')}
                    className="w-full px-4 py-3 bg-[rgba(231,103,76,0.14)] text-[color:var(--gt-primary-strong)] rounded-lg font-medium hover:bg-[rgba(231,103,76,0.22)] transition-colors"
                  >
                    フォローリクエストを管理
                  </button>
                </div>
              )}

              {gymActivityPrivate && (
                <div className="p-3 bg-[rgba(245,177,143,0.12)] rounded-lg border border-[rgba(231,103,76,0.24)]">
                  <p className="text-xs text-[color:var(--gt-tertiary-strong)]">
                    ⚠️ ジム活動が非公開に設定されています。他のユーザーからあなたの投稿や統計は見えません。
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ログアウトセクション */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[color:var(--foreground)] mb-4">アカウント</h3>
            
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-[rgba(224,112,122,0.12)] hover:bg-[color:var(--gt-primary-strong)] text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 border-2 border-[color:var(--gt-primary)]"
            >
              <LogOut className="w-5 h-5" />
              ログアウト
            </button>
          </div>

          {/* 保存ボタン（モバイル用） */}
          <button
            onClick={handleSave}
            className="w-full py-4 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 sm:hidden border-2 border-transparent"
          >
            <Save className="w-5 h-5" />
            プロフィールを保存
          </button>
        </div>
      </main>
    </div>
  )
}
