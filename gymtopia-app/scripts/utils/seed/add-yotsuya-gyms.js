const { createClient } = require('@supabase/supabase-js')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 固定のUUID IDを生成（再実行時も同じIDを使用）
const gymIds = {
  joyfit24_yotsuyaSanchome: '8f5a2b4e-7c91-4123-a456-426614183004',
  curves_yotsuya: '8f5a2b4e-7c91-4123-a456-426614183005',
  tipness_yotsuya: '8f5a2b4e-7c91-4123-a456-426614183006',
  rizap_yotsuya: '8f5a2b4e-7c91-4123-a456-426614183007',
  joyfit24_yotsuya: '8f5a2b4e-7c91-4123-a456-426614183008'
}

const yotsuyaGyms = [
  {
    id: gymIds.joyfit24_yotsuyaSanchome,
    name: 'JOYFIT24四谷三丁目',
    description: '24時間年中無休のフィットネスジム。充実のマシンラインナップと、セキュリティ完備で女性も安心してトレーニングできる環境を提供。四谷三丁目駅から徒歩1分の好立地。',
    prefecture: '東京都',
    city: '新宿区',
    address: '東京都新宿区四谷3-5-1 四谷三丁目ビル3F',
    latitude: 35.688437,
    longitude: 139.720523,
    images: ['https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=1200&h=600&fit=crop&q=80'],
    rating: 4.4,
    review_count: 387,
    business_hours: '24時間営業',
    phone: '03-6380-5678',
    website: 'https://joyfit.jp/yotsuya/',
    has_24h: true,
    has_shower: true,
    has_locker: true,
    has_parking: false,
    has_sauna: false,
    facilities: {
      '24hours': true,
      shower: true,
      locker: true,
      wifi: true,
      parking: false
    },
    equipment_types: ['machine', 'free_weight'],
    status: 'active',
    verified: true
  },
  {
    id: gymIds.curves_yotsuya,
    name: 'カーブス四谷',
    description: '女性専用の30分フィットネス。予約不要で気軽に通える、筋トレと有酸素運動を組み合わせた効率的なサーキットトレーニングを提供。',
    prefecture: '東京都',
    city: '新宿区',
    address: '東京都新宿区四谷1-8-14 四谷一丁目ビル2F',
    latitude: 35.686854,
    longitude: 139.729476,
    images: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&h=600&fit=crop&q=80'],
    rating: 4.6,
    review_count: 256,
    business_hours: '平日 10:00-19:00 / 土 10:00-13:00',
    holidays: '日曜・祝日',
    phone: '03-3355-7890',
    website: 'https://www.curves.co.jp/search/kanto/tokyo/yotsuya/',
    has_24h: false,
    has_shower: true,
    has_locker: true,
    has_parking: false,
    has_sauna: false,
    facilities: {
      women_only: true,
      shower: true,
      locker: true,
      group_lesson: true
    },
    equipment_types: ['machine'],
    status: 'active',
    verified: true
  },
  {
    id: gymIds.tipness_yotsuya,
    name: 'ティップネス四谷',
    description: 'プール・スタジオ・ジムを完備した総合フィットネスクラブ。ヨガ、ピラティス、ダンスなど豊富なスタジオプログラムが魅力。四谷駅直結でアクセス抜群。',
    prefecture: '東京都',
    city: '新宿区',
    address: '東京都新宿区四谷1-6-1 コモレ四谷 4F',
    latitude: 35.685693,
    longitude: 139.730234,
    images: ['https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=1200&h=600&fit=crop&q=80'],
    rating: 4.3,
    review_count: 498,
    business_hours: '平日 7:00-23:00 / 土 9:00-22:00 / 日祝 9:00-20:00',
    phone: '03-5360-2345',
    website: 'https://www.tipness.co.jp/shop/yotsuya/',
    has_24h: false,
    has_shower: true,
    has_locker: true,
    has_parking: true,
    has_sauna: true,
    facilities: {
      pool: true,
      studio: true,
      shower: true,
      locker: true,
      sauna: true,
      jacuzzi: true,
      parking: true,
      group_lesson: true
    },
    equipment_types: ['machine', 'free_weight'],
    status: 'active',
    verified: true
  },
  {
    id: gymIds.rizap_yotsuya,
    name: 'パーソナルジムRIZAP四谷店',
    description: '完全個室のマンツーマントレーニングで、確実な結果にコミット。専属トレーナーと管理栄養士による徹底サポートで理想の体型を実現。',
    prefecture: '東京都',
    city: '新宿区',
    address: '東京都新宿区四谷2-2-2 四谷二丁目ビル6F',
    latitude: 35.687234,
    longitude: 139.726543,
    images: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=600&fit=crop&q=80'],
    rating: 4.7,
    review_count: 145,
    business_hours: '7:00-23:00',
    phone: '0120-700-900',
    website: 'https://www.rizap.jp/gym/yotsuya/',
    has_24h: false,
    has_shower: true,
    has_locker: true,
    has_parking: false,
    has_sauna: false,
    facilities: {
      personal_training: true,
      shower: true,
      locker: true,
      wifi: true
    },
    equipment_types: ['free_weight'],
    status: 'active',
    verified: true
  },
  {
    id: gymIds.joyfit24_yotsuya,
    name: 'JOYFIT24 四谷',
    description: '四谷駅徒歩3分。24時間営業で、仕事帰りでも早朝でも自分のペースでトレーニング可能。最新のマシンと充実の設備で、初心者から上級者まで満足できる環境。',
    prefecture: '東京都',
    city: '新宿区',
    address: '東京都新宿区四谷1-15 アーバンビルサカス8 B1F',
    latitude: 35.686123,
    longitude: 139.728956,
    images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=600&fit=crop&q=80'],
    rating: 4.5,
    review_count: 425,
    business_hours: '24時間営業',
    phone: '03-6273-1234',
    website: 'https://joyfit.jp/yotsuya-main/',
    has_24h: true,
    has_shower: true,
    has_locker: true,
    has_parking: false,
    has_sauna: false,
    facilities: {
      '24hours': true,
      shower: true,
      locker: true,
      wifi: true,
      massage_chair: true
    },
    equipment_types: ['machine', 'free_weight'],
    status: 'active',
    verified: true
  }
]

async function addYotsuyaGyms() {
  console.log('四谷エリアのジムデータを追加中...')

  for (const gym of yotsuyaGyms) {
    try {
      const { error } = await supabase
        .from('gyms')
        .upsert(gym, { onConflict: 'id' })

      if (error) {
        console.error(`Error adding gym ${gym.name}:`, error)
      } else {
        console.log(`✅ ${gym.name} を追加しました`)
      }
    } catch (err) {
      console.error(`Error adding gym ${gym.name}:`, err)
    }
  }

  console.log('\n全てのジムデータの追加が完了しました！')
}

addYotsuyaGyms()