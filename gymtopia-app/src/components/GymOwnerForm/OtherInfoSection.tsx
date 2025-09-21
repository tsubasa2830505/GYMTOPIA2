'use client'

import { Plus, Trash2 } from 'lucide-react'
import type { OtherInformation } from '@/lib/supabase/gym-detailed-info'

interface OtherInfoSectionProps {
  data: OtherInformation
  onChange: (data: OtherInformation) => void
}

export default function OtherInfoSection({ data, onChange }: OtherInfoSectionProps) {
  return (
    <div className="space-y-8">
      {/* 特別プログラム */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">特別プログラム</h3>
        <textarea
          value={data.special_programs?.join('\n') || ''}
          onChange={(e) => onChange({
            ...data,
            special_programs: e.target.value.split('\n').filter(program => program.trim())
          })}
          placeholder="例：&#10;毎週土曜：パワーリフティング講習会&#10;第2日曜：栄養セミナー&#10;月1回：ゲストトレーナー招聘イベント&#10;季節限定：ダイエットチャレンジ"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* イベント */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">定期イベント</h3>
        <textarea
          value={data.events?.join('\n') || ''}
          onChange={(e) => onChange({
            ...data,
            events: e.target.value.split('\n').filter(event => event.trim())
          })}
          placeholder="例：&#10;新年会員キャンペーン（1月）&#10;夏の身体づくりチャレンジ（6-8月）&#10;秋の健康診断フェア（10月）&#10;年末大掃除イベント（12月）"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* お知らせ */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">重要なお知らせ</h3>
        <textarea
          value={data.announcements?.join('\n') || ''}
          onChange={(e) => onChange({
            ...data,
            announcements: e.target.value.split('\n').filter(announcement => announcement.trim())
          })}
          placeholder="例：&#10;【重要】12/28-1/3は年末年始休業です&#10;【NEW】新しいパワーラック導入しました&#10;【改装】更衣室をリニューアル予定（来月）&#10;【感染対策】マスク着用にご協力ください"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 連絡先情報 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">連絡先情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">問い合わせメール</label>
            <input
              type="email"
              value={data.contact_info?.inquiry_email || ''}
              onChange={(e) => onChange({
                ...data,
                contact_info: { ...data.contact_info, inquiry_email: e.target.value }
              })}
              placeholder="例：info@mygym.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">問い合わせ電話</label>
            <input
              type="tel"
              value={data.contact_info?.inquiry_phone || ''}
              onChange={(e) => onChange({
                ...data,
                contact_info: { ...data.contact_info, inquiry_phone: e.target.value }
              })}
              placeholder="例：03-1234-5678"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">返信時間</label>
            <input
              type="text"
              value={data.contact_info?.response_time || ''}
              onChange={(e) => onChange({
                ...data,
                contact_info: { ...data.contact_info, response_time: e.target.value }
              })}
              placeholder="例：24時間以内、平日営業時間内"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* SNS・ウェブサイト */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SNS・ウェブサイト</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ウェブサイト</label>
            <input
              type="url"
              value={data.social_media?.website || ''}
              onChange={(e) => onChange({
                ...data,
                social_media: { ...data.social_media, website: e.target.value }
              })}
              placeholder="例：https://www.mygym.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
            <input
              type="url"
              value={data.social_media?.instagram || ''}
              onChange={(e) => onChange({
                ...data,
                social_media: { ...data.social_media, instagram: e.target.value }
              })}
              placeholder="例：https://instagram.com/mygym"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
            <input
              type="url"
              value={data.social_media?.facebook || ''}
              onChange={(e) => onChange({
                ...data,
                social_media: { ...data.social_media, facebook: e.target.value }
              })}
              placeholder="例：https://facebook.com/mygym"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
            <input
              type="url"
              value={data.social_media?.twitter || ''}
              onChange={(e) => onChange({
                ...data,
                social_media: { ...data.social_media, twitter: e.target.value }
              })}
              placeholder="例：https://twitter.com/mygym"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* アメニティ */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">アメニティ・設備</h3>
        <textarea
          value={data.amenities?.join('\n') || ''}
          onChange={(e) => onChange({
            ...data,
            amenities: e.target.value.split('\n').filter(amenity => amenity.trim())
          })}
          placeholder="例：&#10;無料WiFi&#10;ウォーターサーバー&#10;ドライヤー&#10;ロッカー（有料）&#10;タオルレンタル&#10;プロテインバー&#10;マッサージチェア"
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 特徴・強み */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">当ジムの特徴・強み</h3>
        <textarea
          value={data.unique_features?.join('\n') || ''}
          onChange={(e) => onChange({
            ...data,
            unique_features: e.target.value.split('\n').filter(feature => feature.trim())
          })}
          placeholder="例：&#10;24時間365日営業&#10;最新マシン完備&#10;女性専用エリアあり&#10;パーソナルトレーナー在中&#10;栄養士による食事指導&#10;格闘技クラス充実&#10;アクセス抜群（駅から徒歩2分）"
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* その他の情報 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">その他の情報</h3>
        <textarea
          value={data.additional_notes || ''}
          onChange={(e) => onChange({ ...data, additional_notes: e.target.value })}
          placeholder="UIでは表現しきれない詳細情報や、会員様に伝えたい特別な情報をご記入ください。&#10;&#10;例：&#10;・コロナ対策として定期的な換気・消毒を実施&#10;・季節に応じてイベントやキャンペーンを開催&#10;・地域密着型のアットホームな雰囲気&#10;・トレーニング歴問わず、皆様に楽しんでいただけます"
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  )
}