'use client'

import type { RulesAndPolicies } from '@/lib/supabase/gym-detailed-info'

interface RulesSectionProps {
  data: RulesAndPolicies
  onChange: (data: RulesAndPolicies) => void
}

export default function RulesSection({ data, onChange }: RulesSectionProps) {
  return (
    <div className="space-y-8">
      {/* 一般ルール */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">一般ルール</h3>
        <textarea
          value={data.general_rules?.join('\n') || ''}
          onChange={(e) => onChange({
            ...data,
            general_rules: e.target.value.split('\n').filter(rule => rule.trim())
          })}
          placeholder="例：&#10;器具使用後は消毒をお願いします&#10;大声での会話はお控えください&#10;器具の独占利用は30分までとします&#10;携帯電話での通話は禁止です"
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 服装規定 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">服装規定</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">必須アイテム</label>
            <textarea
              value={data.dress_code?.required?.join('\n') || ''}
              onChange={(e) => onChange({
                ...data,
                dress_code: {
                  ...data.dress_code,
                  required: e.target.value.split('\n').filter(item => item.trim())
                }
              })}
              placeholder="例：&#10;室内シューズ&#10;運動着&#10;タオル"
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">禁止アイテム</label>
            <textarea
              value={data.dress_code?.prohibited?.join('\n') || ''}
              onChange={(e) => onChange({
                ...data,
                dress_code: {
                  ...data.dress_code,
                  prohibited: e.target.value.split('\n').filter(item => item.trim())
                }
              })}
              placeholder="例：&#10;サンダル・ヒール&#10;裸足&#10;ジーンズ&#10;アクセサリー類"
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">服装に関する備考</label>
          <textarea
            value={data.dress_code?.notes || ''}
            onChange={(e) => onChange({
              ...data,
              dress_code: { ...data.dress_code, notes: e.target.value }
            })}
            placeholder="例：シューズ・タオルのレンタルもご利用いただけます（有料）"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* 器具利用ルール */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">器具利用ルール</h3>
        <textarea
          value={data.equipment_rules?.join('\n') || ''}
          onChange={(e) => onChange({
            ...data,
            equipment_rules: e.target.value.split('\n').filter(rule => rule.trim())
          })}
          placeholder="例：&#10;プレートは使用後必ず元の位置に戻してください&#10;ダンベルの落下にご注意ください&#10;故障や不具合を発見した場合はスタッフまでお声がけください&#10;器具の持ち込みは禁止です"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 安全ガイドライン */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">安全ガイドライン</h3>
        <textarea
          value={data.safety_guidelines?.join('\n') || ''}
          onChange={(e) => onChange({
            ...data,
            safety_guidelines: e.target.value.split('\n').filter(guideline => guideline.trim())
          })}
          placeholder="例：&#10;運動前は必ずウォームアップを行ってください&#10;体調不良の際のご利用はお控えください&#10;無理な重量での運動は避けてください&#10;補助が必要な場合はスタッフまでお声がけください"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 行動規範 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">行動規範</h3>
        <textarea
          value={data.behavior_policy || ''}
          onChange={(e) => onChange({ ...data, behavior_policy: e.target.value })}
          placeholder="例：&#10;他の利用者への迷惑行為は禁止です。&#10;写真・動画撮影は事前に許可を得てください。&#10;営業行為や勧誘行為は禁止です。&#10;アルコール・薬物の使用は禁止です。"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* ゲストポリシー */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ゲストポリシー</h3>
        <textarea
          value={data.guest_policy || ''}
          onChange={(e) => onChange({ ...data, guest_policy: e.target.value })}
          placeholder="例：&#10;会員様のゲストは事前申請が必要です。&#10;ゲスト料金：1日¥2,000&#10;ゲストの方も同様のルールに従っていただきます。&#10;会員様にはゲストの行動について責任を負っていただきます。"
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 年齢制限 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">年齢制限</h3>
        <textarea
          value={data.age_restrictions || ''}
          onChange={(e) => onChange({ ...data, age_restrictions: e.target.value })}
          placeholder="例：&#10;18歳未満の方は保護者の同意書が必要です。&#10;15歳未満の方は保護者同伴でご利用ください。&#10;高校生以下の方は22時以降の利用はできません。"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* その他のポリシー */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">その他のポリシー</h3>
        <textarea
          value={data.other_policies?.join('\n') || ''}
          onChange={(e) => onChange({
            ...data,
            other_policies: e.target.value.split('\n').filter(policy => policy.trim())
          })}
          placeholder="例：&#10;貴重品は各自で管理をお願いします&#10;ロッカーの鍵の紛失は弁償していただきます&#10;館内での事故・怪我については当施設では責任を負いかねます&#10;規約違反の場合は利用をお断りする場合があります"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  )
}