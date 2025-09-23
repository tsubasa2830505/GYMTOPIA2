/**
 * EquipmentForm - 一般ユーザー向け機器登録コンポーネント
 *
 * 機能:
 * - 3ステップの直感的な選択フロー (カテゴリ → 機器名 → メーカー)
 * - 設備マスターデータベース統合
 * - リアルタイム選択肢更新
 * - 複数機器の一括登録
 * - ジム名からジムID自動解決
 * - 詳細な成功・エラー通知
 * - 作成者追跡機能
 *
 * UI/UX特徴:
 * - モバイルファースト レスポンシブデザイン
 * - ビジュアルステップインジケータ
 * - リアルタイムフィードバック
 * - アクセシブル フォームコントロール
 * - 直感的なアイコン使用
 */
import { memo, useState, useMemo } from 'react'
import { Building, AlertCircle, Plus, Check, Dumbbell, Settings, Hash } from 'lucide-react'
import { equipmentDatabase, getCategories, getEquipmentByCategory } from '@/data/equipment-database'
import { suggestGymEquipment } from '@/lib/supabase/admin'
import type { EquipmentFormProps } from '../types'

interface NewEquipment {
  type: 'machine' | 'freeweight'
  category: string
  name: string
  brand: string
  count: number
  weight_range?: string
  gymId: string
}

const EquipmentForm = memo(function EquipmentForm({
  state,
  onStateChange,
  onSubmit,
  gymData = []
}: EquipmentFormProps) {
  const [newEquipment, setNewEquipment] = useState<NewEquipment>({
    type: 'machine',
    category: '',
    name: '',
    brand: '',
    count: 1,
    weight_range: '',
    gymId: ''
  })
  const [isAdding, setIsAdding] = useState(false)
  const [addedEquipment, setAddedEquipment] = useState<any[]>([])
  const [gymSearchQuery, setGymSearchQuery] = useState('')

  // Filter gyms by search query
  const filteredGymList = useMemo(() => {
    if (!gymSearchQuery) return state.gymList
    const query = gymSearchQuery.toLowerCase()
    return state.gymList.filter(gym =>
      gym.toLowerCase().includes(query)
    )
  }, [state.gymList, gymSearchQuery])

  // カテゴリ一覧を取得
  const categories = useMemo(() => getCategories(), [])

  // 選択されたカテゴリに基づいて機器一覧を取得
  const availableEquipment = useMemo(() => {
    if (!newEquipment.category) return []
    return getEquipmentByCategory(newEquipment.category)
  }, [newEquipment.category])

  // 選択された機器に基づいてメーカー一覧を取得
  const availableManufacturers = useMemo(() => {
    const selectedEquipment = availableEquipment.find(eq => eq.name === newEquipment.name)
    return selectedEquipment?.manufacturers || []
  }, [availableEquipment, newEquipment.name])

  // カテゴリが変更された時の処理
  const handleCategoryChange = (category: string) => {
    setNewEquipment(prev => ({
      ...prev,
      category,
      name: '',
      brand: '',
      // typeをカテゴリから推測
      type: ['フリーウェイト', 'ベンチ・ラック'].includes(category) ? 'freeweight' : 'machine'
    }))
  }

  // 機器名が変更された時の処理
  const handleEquipmentNameChange = (name: string) => {
    const selectedEquipment = availableEquipment.find(eq => eq.name === name)
    setNewEquipment(prev => ({
      ...prev,
      name,
      brand: selectedEquipment?.manufacturers[0] || ''
    }))
  }

  // 機器をリストに追加
  const handleAddToList = () => {
    if (!newEquipment.category || !newEquipment.name || !newEquipment.brand) {
      alert('カテゴリ、機器名、メーカーは必須項目です')
      return
    }

    const equipment = {
      id: Date.now().toString(),
      ...newEquipment,
      gymName: state.equipmentGymName
    }

    setAddedEquipment(prev => [...prev, equipment])

    // フォームをリセット
    setNewEquipment({
      type: 'machine',
      category: '',
      name: '',
      brand: '',
      count: 1,
      weight_range: '',
      gymId: ''
    })
  }

  // リストから機器を削除
  const handleRemoveFromList = (id: string) => {
    setAddedEquipment(prev => prev.filter(eq => eq.id !== id))
  }

  // 全体を登録
  const handleSubmitAll = async () => {
    if (addedEquipment.length === 0) {
      alert('登録する機器を追加してください')
      return
    }

    if (!state.equipmentGymName) {
      alert('ジムを選択してください')
      return
    }

    // ジム名からGymIDを取得
    const selectedGym = gymData.find(gym => gym.name === state.equipmentGymName)
    if (!selectedGym) {
      alert('選択されたジムが見つかりません')
      return
    }

    setIsAdding(true)
    try {
      // 各機器をデータベースに登録（一般ユーザーは提案として登録）
      for (const equipment of addedEquipment) {
        await suggestGymEquipment(selectedGym.id, {
          type: equipment.type,
          name: equipment.name,
          brand: equipment.brand,
          count: equipment.count,
          weight_range: equipment.weight_range || undefined
        })
      }

      setAddedEquipment([])

      // 機器登録完了後、通知を表示とサマリー情報更新
      console.log(`${addedEquipment.length}件の機器を${state.equipmentGymName}に登録しました`)

      onStateChange({
        showEquipmentConfirmation: true,
        equipmentRegistrationSummary: {
          count: addedEquipment.length,
          gymName: state.equipmentGymName
        }
      })
    } catch (error) {
      console.error('Error registering equipment:', error)
      alert('機器の登録に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'))
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ジム選択 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <label className="block text-sm font-bold text-[color:var(--foreground)] mb-3">
          <Building className="w-4 h-4 inline mr-2" />
          ジムを選択 <span className="text-[color:var(--gt-primary)]">*</span>
        </label>

        {/* 検索入力 */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="ジム名で検索..."
            value={gymSearchQuery}
            onChange={(e) => setGymSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] focus:border-transparent"
          />
          {gymSearchQuery && (
            <button
              onClick={() => setGymSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ジム選択セレクト */}
        <select
          value={state.equipmentGymName}
          onChange={(e) => {
            onStateChange({ equipmentGymName: e.target.value })
            setGymSearchQuery('') // Clear search after selection
          }}
          className="w-full px-4 py-3 bg-[rgba(254,255,250,0.96)] border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-[color:var(--foreground)]"
          required
        >
          <option value="">ジムを選択してください</option>
          {filteredGymList.length > 0 ? (
            filteredGymList.map((gym, index) => (
              <option key={`${gym}-${index}`} value={gym}>{gym}</option>
            ))
          ) : (
            <option value="" disabled>
              「{gymSearchQuery}」に一致するジムが見つかりません
            </option>
          )}
        </select>

        {/* 検索結果の情報 */}
        {gymSearchQuery && (
          <div className="mt-2 text-xs text-gray-600">
            {filteredGymList.length > 0 ? (
              <span>{filteredGymList.length}件のジムが見つかりました</span>
            ) : (
              <button
                onClick={() => setGymSearchQuery('')}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                検索をクリア
              </button>
            )}
          </div>
        )}
      </div>

      {/* 注意事項 */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">💡 簡単3ステップで機器登録</p>
            <div className="text-xs leading-relaxed space-y-1">
              <p>• カテゴリ → 機器名 → メーカーを選んで「追加」</p>
              <p>• 複数の機器をリストに追加できます</p>
              <p>• 最後に「まとめて登録」で完了！</p>
            </div>
          </div>
        </div>
      </div>

      {/* 機器追加フォーム */}
      <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-dashed border-[rgba(231,103,76,0.3)]">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-[color:var(--gt-primary)]" />
          <h3 className="text-lg font-bold text-[color:var(--foreground)]">機器を追加</h3>
        </div>

        <div className="space-y-4">
          {/* ステップ1: カテゴリ選択 */}
          <div>
            <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
              <Settings className="w-4 h-4 inline mr-1" />
              ステップ1: カテゴリを選択
            </label>
            <select
              value={newEquipment.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(186,122,103,0.26)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] bg-white"
            >
              <option value="">カテゴリを選択してください</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* ステップ2: 機器名選択 */}
          {newEquipment.category && (
            <div>
              <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
                <Dumbbell className="w-4 h-4 inline mr-1" />
                ステップ2: 機器名を選択
              </label>
              <select
                value={newEquipment.name}
                onChange={(e) => handleEquipmentNameChange(e.target.value)}
                className="w-full px-4 py-3 border border-[rgba(186,122,103,0.26)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] bg-white"
              >
                <option value="">機器を選択してください</option>
                {availableEquipment.map(equipment => (
                  <option key={equipment.id} value={equipment.name}>{equipment.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* ステップ3: メーカーと詳細 */}
          {newEquipment.name && availableManufacturers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
                  ステップ3: メーカー
                </label>
                <select
                  value={newEquipment.brand}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-3 py-2 border border-[rgba(186,122,103,0.26)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] bg-white"
                >
                  <option value="">メーカー選択</option>
                  {availableManufacturers.map(manufacturer => (
                    <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  台数
                </label>
                <input
                  type="number"
                  value={newEquipment.count}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-[rgba(186,122,103,0.26)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)]"
                  min="1"
                />
              </div>
              {newEquipment.type === 'freeweight' && (
                <div>
                  <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
                    重量範囲 (任意)
                  </label>
                  <input
                    type="text"
                    value={newEquipment.weight_range}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, weight_range: e.target.value }))}
                    className="w-full px-3 py-2 border border-[rgba(186,122,103,0.26)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)]"
                    placeholder="例: 1kg-50kg"
                  />
                </div>
              )}
            </div>
          )}

          {/* 追加ボタン */}
          {newEquipment.category && newEquipment.name && newEquipment.brand && (
            <div className="pt-2">
              <button
                onClick={handleAddToList}
                className="w-full md:w-auto px-6 py-3 bg-[color:var(--gt-primary)] text-white rounded-lg font-medium hover:bg-[color:var(--gt-primary-strong)] transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                リストに追加
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 追加された機器リスト */}
      {addedEquipment.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[color:var(--foreground)] mb-4">
            登録予定の機器 ({addedEquipment.length}件)
          </h3>
          <div className="space-y-3">
            {addedEquipment.map((equipment) => (
              <div key={equipment.id} className="flex items-center justify-between p-4 bg-[rgba(254,255,250,0.96)] border border-[rgba(186,122,103,0.15)] rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-[color:var(--foreground)]">{equipment.name}</span>
                    <span className="text-xs px-2 py-1 bg-[rgba(231,103,76,0.12)] text-[color:var(--gt-primary-strong)] rounded-full">
                      {equipment.brand}
                    </span>
                    <span className="text-xs text-[color:var(--text-muted)]">
                      {equipment.count}台
                    </span>
                  </div>
                  <div className="text-xs text-[color:var(--text-muted)]">
                    カテゴリ: {equipment.category}
                    {equipment.weight_range && ` | 重量: ${equipment.weight_range}`}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFromList(equipment.id)}
                  className="ml-3 px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md transition"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 確認ダイアログ */}
      {state.showEquipmentConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-[color:var(--foreground)] mb-2">
                登録完了
              </h3>
              <p className="text-[color:var(--text-muted)] mb-6">
                <strong>{state.equipmentRegistrationSummary?.gymName || 'ジム'}</strong>に
                <strong>{state.equipmentRegistrationSummary?.count || 0}件</strong>の機器情報を提供しました。<br/>
                <span className="text-sm">ジムオーナーによる確認後、情報が反映されます。<br/>
                ご協力ありがとうございました！</span>
              </p>
              <button
                onClick={() => onStateChange({ showEquipmentConfirmation: false })}
                className="w-full py-3 bg-[var(--gt-primary)] text-white rounded-lg font-medium hover:bg-[var(--gt-primary-strong)] transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* まとめて登録ボタン */}
      <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-[rgba(231,103,76,0.16)]">
        <button
          type="button"
          onClick={handleSubmitAll}
          disabled={isAdding || addedEquipment.length === 0 || !state.equipmentGymName}
          className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-all ${
            isAdding || addedEquipment.length === 0 || !state.equipmentGymName
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] hover:from-[var(--gt-primary-strong)] hover:to-[var(--gt-tertiary)] shadow-lg hover:shadow-xl'
          }`}
        >
          {isAdding ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              登録中...
            </div>
          ) : (
            `まとめて登録 (${addedEquipment.length}件)`
          )}
        </button>
      </div>
    </div>
  )
})

export default EquipmentForm