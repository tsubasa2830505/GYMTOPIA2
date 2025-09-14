'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Save, X, Camera, MapPin, User, AtSign, FileText, Dumbbell, Plus, Trash2, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'

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

  // Basic Info
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  
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

  // ユーザー情報の取得
  useEffect(() => {
    if (user?.id) {
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setName(data.display_name || '')
        setUsername(data.username || '')
        setBio(data.bio || '')
        setLocation(data.location || '')
        setAvatarUrl(data.avatar_url || '')
      }
    } catch (error) {
      console.error('プロフィール取得エラー:', error)
    }
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

    // モック認証の場合はログ出力のみ
    if (user?.email === 'taro@example.com') {
      console.log('モック認証ユーザーでの保存処理を開始')
    }

    if (!user?.id) {
      alert('ログインが必要です')
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
      const isDemo = user?.email === 'taro@example.com' || user?.id === 'demo-user-id'

      if (!isDemo) {
        const { data: { session: authSession } } = await supabase.auth.getSession()
        session = authSession
        console.log('現在のセッション:', session)

        if (!session) {
          throw new Error('認証セッションが見つかりません。再ログインしてください。')
        }
      } else {
        console.log('デモユーザーのため、セッションチェックをスキップ')
      }

      // 画像のアップロード処理
      if (uploadedFile) {
        const fileExt = uploadedFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        // 古い画像を削除
        if (avatarUrl && avatarUrl.includes('supabase')) {
          const oldPath = avatarUrl.split('/').pop()
          if (oldPath) {
            await supabase.storage
              .from('avatars')
              .remove([`avatars/${oldPath}`])
          }
        }

        // 新しい画像をアップロード
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, uploadedFile)

        if (uploadError) throw uploadError

        // 公開URLを取得
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        uploadedAvatarUrl = publicUrl
      }

      // プロフィール情報の更新
      console.log('更新データ:', {
        display_name: name,
        username: username,
        bio: bio,
        location: location,
        avatar_url: uploadedAvatarUrl,
        updated_at: new Date().toISOString()
      })

      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({
          display_name: name,
          username: username,
          bio: bio,
          location: location,
          avatar_url: uploadedAvatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()

      console.log('更新結果:', { updateData, updateError })

      if (updateError) throw updateError

      alert('プロフィールを更新しました')
      router.push('/profile')
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">プロフィール編集</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <label className="block text-sm font-bold text-slate-900 mb-4">
              <Camera className="w-4 h-4 inline mr-2" />
              プロフィール画像
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image 
                  src={previewImage || avatarUrl} 
                  alt="筋トレマニア太郎" 
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                {previewImage && (
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-2">プロフィール画像を変更</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    画像を選択
                  </button>
                  {previewImage && (
                    <button 
                      onClick={handleRemoveImage}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      削除
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
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
            <h3 className="text-sm font-bold text-slate-900 mb-4">基本情報</h3>
            
            {/* 名前 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                名前
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                placeholder="表示名を入力"
              />
            </div>

            {/* ユーザー名 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <AtSign className="w-4 h-4 inline mr-1" />
                ユーザー名
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  placeholder="username"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">半角英数字とアンダースコアのみ使用可能</p>
            </div>

            {/* 位置情報 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                位置情報
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                placeholder="都市名を入力"
              />
            </div>

            {/* 自己紹介 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                自己紹介
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
                placeholder="自己紹介を入力"
              />
              <p className="text-xs text-slate-500 mt-1">{bio.length} / 150文字</p>
            </div>
          </div>

          {/* パーソナルレコード */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                パーソナルレコード
              </h3>
              {!showRecordForm && (
                <button
                  onClick={() => setShowRecordForm(true)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  追加
                </button>
              )}
            </div>

            {/* 既存のレコード */}
            <div className="space-y-2 mb-4">
              {personalRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{record.exercise}</p>
                    <p className="text-sm text-slate-600">
                      {record.weight}kg × {record.reps}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveRecord(record.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* レコード追加フォーム */}
            {showRecordForm && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                <input
                  type="text"
                  placeholder="種目名（例：ベンチプレス）"
                  value={newRecord.exercise}
                  onChange={(e) => setNewRecord({ ...newRecord, exercise: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="重量(kg)"
                    value={newRecord.weight}
                    onChange={(e) => setNewRecord({ ...newRecord, weight: e.target.value })}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="回数（例：5回×3セット）"
                    value={newRecord.reps}
                    onChange={(e) => setNewRecord({ ...newRecord, reps: e.target.value })}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddRecord}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    追加
                  </button>
                  <button
                    onClick={() => {
                      setShowRecordForm(false)
                      setNewRecord({ id: '', exercise: '', weight: '', reps: '' })
                    }}
                    className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* トレーニング設定 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">トレーニング設定</h3>
            
            {/* トレーニング頻度 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                トレーニング頻度
              </label>
              <select 
                defaultValue="週5-6回"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              >
                <option>週1-2回</option>
                <option>週3-4回</option>
                <option>週5-6回</option>
                <option>毎日</option>
              </select>
            </div>

            {/* 主なトレーニング時間帯 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                主なトレーニング時間帯
              </label>
              <select 
                defaultValue="夜（17:00-22:00）"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
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
              <label className="block text-sm font-medium text-slate-700 mb-2">
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
            <h3 className="text-sm font-bold text-slate-900 mb-4">プライバシー設定</h3>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-700">プロフィールを公開</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-700">ジム活を公開</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-700">パーソナルレコードを公開</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-700">位置情報を表示</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
            </div>
          </div>

          {/* ログアウトセクション */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">アカウント</h3>
            
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              ログアウト
            </button>
          </div>

          {/* 保存ボタン（モバイル用） */}
          <button
            onClick={handleSave}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 sm:hidden"
          >
            <Save className="w-5 h-5" />
            プロフィールを保存
          </button>
        </div>
      </main>
    </div>
  )
}