import { memo } from 'react'
import { Building, AlertCircle } from 'lucide-react'
import FreeWeightSelector from '@/components/FreeWeightSelector'
import MachineSelector from '@/components/MachineSelector'
import type { EquipmentFormProps } from '../types'

const EquipmentForm = memo(function EquipmentForm({
  state,
  onStateChange,
  onSubmit
}: EquipmentFormProps) {
  const handleFacilityFormChange = (newData: any) => {
    onStateChange({ facilityFormData: newData })
  }

  return (
    <div className="space-y-6">
      {/* ジム選択 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <label className="block text-sm font-bold text-[color:var(--foreground)] mb-3">
          <Building className="w-4 h-4 inline mr-2" />
          ジムを選択 <span className="text-[color:var(--gt-primary)]">*</span>
        </label>
        <select
          value={state.equipmentGymName}
          onChange={(e) => onStateChange({ equipmentGymName: e.target.value })}
          className="w-full px-4 py-3 bg-[rgba(254,255,250,0.96)] border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-[color:var(--foreground)]"
          required
        >
          <option value="">ジムを選択してください</option>
          {state.gymList.map((gym, index) => (
            <option key={`${gym}-${index}`} value={gym}>{gym}</option>
          ))}
        </select>
      </div>

      {/* 注意事項 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">ジム機器情報の登録について</p>
            <p className="text-xs leading-relaxed">
              正確な機器情報を入力してください。不正確な情報は他のユーザーに迷惑をかける可能性があります。
              管理者による確認後、情報が公開されます。
            </p>
          </div>
        </div>
      </div>

      {/* フリーウェイト設備 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[color:var(--foreground)] mb-4">
          フリーウェイト設備
        </h3>
        <FreeWeightSelector
          data={state.facilityFormData.freeWeights || {}}
          onChange={(data) => handleFacilityFormChange({
            ...state.facilityFormData,
            freeWeights: data
          })}
        />
      </div>

      {/* マシン設備 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[color:var(--foreground)] mb-4">
          マシン設備
        </h3>
        <MachineSelector
          data={state.facilityFormData.machines || {}}
          onChange={(data) => handleFacilityFormChange({
            ...state.facilityFormData,
            machines: data
          })}
        />
      </div>

      {/* 確認ダイアログ */}
      {state.showEquipmentConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[color:var(--foreground)] mb-2">
                登録完了
              </h3>
              <p className="text-[color:var(--text-muted)] mb-6">
                ジム機器情報の登録が完了しました。管理者による確認後、情報が公開されます。
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

      {/* 登録ボタン */}
      <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-[rgba(231,103,76,0.16)]">
        <button
          type="button"
          onClick={onSubmit}
          disabled={state.isSubmitting || !state.equipmentGymName}
          className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-all ${
            state.isSubmitting || !state.equipmentGymName
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] hover:from-[var(--gt-primary-strong)] hover:to-[var(--gt-tertiary)] shadow-lg hover:shadow-xl'
          }`}
        >
          {state.isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              登録中...
            </div>
          ) : (
            '機器情報を登録'
          )}
        </button>
      </div>
    </div>
  )
})

export default EquipmentForm