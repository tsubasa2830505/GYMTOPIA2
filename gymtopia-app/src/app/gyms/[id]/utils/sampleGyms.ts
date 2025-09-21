interface GymDetail {
  id: string
  name: string
  description: string
  prefecture: string
  city: string
  address: string
  latitude?: string | number
  longitude?: string | number
  image_url: string
  images?: string[]
  rating: number
  users_count: number
  opening_hours?: string
  business_hours?: string
  holidays?: string
  phone?: string
  website?: string
  instagram?: string
  twitter?: string
  equipment?: string[]
  amenities?: string[]
  facilities?: Record<string, boolean>
  has_24h?: boolean
  has_parking?: boolean
  has_shower?: boolean
  has_locker?: boolean
  has_sauna?: boolean
  price_info?: any
  membership_fee?: {
    monthly?: string
    daily?: string
  }
}

export function getSampleGyms(): Record<string, GymDetail> {
  return {
    'gym-1': {
      id: 'gym-1',
      name: 'ゴールドジム渋谷',
      description: '本格的なトレーニング設備が充実した、日本最大級のフィットネスジム。初心者から上級者まで、すべてのトレーニーのニーズに応える設備とサービスを提供しています。',
      prefecture: '東京都',
      city: '渋谷区',
      address: '東京都渋谷区渋谷1-23-16 ココチビル4F',
      latitude: 35.659025,
      longitude: 139.703473,
      image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=600&fit=crop&q=80',
      rating: 4.5,
      users_count: 523,
      opening_hours: '平日 7:00-23:00 / 土日祝 9:00-20:00',
      phone: '03-1234-5678',
      website: 'https://www.goldsgym.jp/shop/13120',
      instagram: '@goldsgym_shibuya',
      twitter: '@goldsgym_shibuya',
      equipment: ['パワーラック', 'スミスマシン', 'ダンベル(1kg~50kg)', 'ケーブルマシン', 'レッグプレス', 'チェストプレス'],
      amenities: ['シャワールーム', 'ロッカー', 'プロテインバー', 'パーソナルトレーニング', '駐車場'],
      membership_fee: {
        monthly: '¥11,000',
        daily: '¥2,750'
      }
    },
    'gym-2': {
      id: 'gym-2',
      name: 'エニタイムフィットネス新宿',
      description: '24時間365日営業で、いつでもトレーニング可能。世界中のエニタイムフィットネスが利用できるグローバルパスポート付き。',
      prefecture: '東京都',
      city: '新宿区',
      address: '東京都新宿区西新宿1-10-1 新宿ビル2F',
      latitude: 35.689634,
      longitude: 139.700566,
      image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop&q=80',
      rating: 4.2,
      users_count: 412,
      opening_hours: '24時間営業',
      phone: '03-9876-5432',
      website: 'https://www.anytimefitness.co.jp/shinjuku/',
      instagram: '@anytime_shinjuku',
      equipment: ['フリーウェイトエリア', 'マシンエリア', 'カーディオエリア', 'ストレッチエリア'],
      amenities: ['シャワールーム', 'セキュリティ完備', '更衣室', 'AED設置'],
      membership_fee: {
        monthly: '¥8,800'
      }
    },
    'gym-3': {
      id: 'gym-3',
      name: 'コナミスポーツクラブ池袋',
      description: 'プール・スタジオ・ジムが完備された総合スポーツクラブ。多彩なプログラムで、楽しみながら健康的な体づくりをサポート。',
      prefecture: '東京都',
      city: '豊島区',
      address: '東京都豊島区東池袋3-1-4 サンシャインシティ文化会館5F',
      latitude: 35.729503,
      longitude: 139.719874,
      image_url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&h=600&fit=crop&q=80',
      rating: 4.3,
      users_count: 342,
      opening_hours: '平日 9:00-23:00 / 土 9:00-22:00 / 日祝 9:00-20:00',
      phone: '03-5555-1234',
      website: 'https://www.konami.com/sportsclub/ikebukuro/',
      twitter: '@konami_ikebukuro',
      equipment: ['最新マシン完備', 'プール(25m×6レーン)', 'スタジオ3面', 'サウナ・ジャグジー'],
      amenities: ['温浴施設', 'パウダールーム', 'ラウンジ', 'キッズスクール', '無料駐車場'],
      membership_fee: {
        monthly: '¥13,200',
        daily: '¥2,640'
      }
    },
    'gym-4': {
      id: 'gym-4',
      name: 'JOYFIT24四谷三丁目',
      description: '24時間年中無休のフィットネスジム。充実のマシンラインナップと、セキュリティ完備で女性も安心してトレーニングできる環境を提供。四谷三丁目駅から徒歩1分の好立地。',
      prefecture: '東京都',
      city: '新宿区',
      address: '東京都新宿区四谷3-5-1 四谷三丁目ビル3F',
      latitude: 35.688437,
      longitude: 139.720523,
      image_url: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=1200&h=600&fit=crop&q=80',
      rating: 4.4,
      users_count: 387,
      opening_hours: '24時間営業',
      phone: '03-6380-5678',
      website: 'https://joyfit.jp/yotsuya/',
      instagram: '@joyfit24_yotsuya',
      equipment: ['パワーラック', 'スミスマシン', 'ダンベル(1kg~40kg)', 'ケーブルマシン', '有酸素マシン30台以上'],
      amenities: ['シャワールーム', '個室更衣室', '契約ロッカー', '水素水サーバー', 'セキュリティカード'],
      membership_fee: {
        monthly: '¥7,920',
        daily: '¥2,200'
      }
    },
    'gym-5': {
      id: 'gym-5',
      name: 'カーブス四谷',
      description: '女性専用の30分フィットネス。予約不要で気軽に通える、筋トレと有酸素運動を組み合わせた効率的なサーキットトレーニングを提供。',
      prefecture: '東京都',
      city: '新宿区',
      address: '東京都新宿区四谷1-8-14 四谷一丁目ビル2F',
      latitude: 35.686854,
      longitude: 139.729476,
      image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&h=600&fit=crop&q=80',
      rating: 4.6,
      users_count: 256,
      opening_hours: '平日 10:00-19:00 / 土 10:00-13:00 / 日祝休み',
      phone: '03-3355-7890',
      website: 'https://www.curves.co.jp/search/kanto/tokyo/yotsuya/',
      equipment: ['油圧式マシン12台', 'ストレッチエリア', 'ステップボード'],
      amenities: ['更衣室', '血圧計', '体組成計', 'AED設置', '女性スタッフ常駐'],
      membership_fee: {
        monthly: '¥6,270'
      }
    },
    'gym-6': {
      id: 'gym-6',
      name: 'ティップネス四谷',
      description: 'プール・スタジオ・ジムを完備した総合フィットネスクラブ。ヨガ、ピラティス、ダンスなど豊富なスタジオプログラムが魅力。四谷駅直結でアクセス抜群。',
      prefecture: '東京都',
      city: '新宿区',
      address: '東京都新宿区四谷1-6-1 コモレ四谷 4F',
      latitude: 35.685693,
      longitude: 139.730234,
      image_url: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=1200&h=600&fit=crop&q=80',
      rating: 4.3,
      users_count: 498,
      opening_hours: '平日 7:00-23:00 / 土 9:00-22:00 / 日祝 9:00-20:00',
      phone: '03-5360-2345',
      website: 'https://www.tipness.co.jp/shop/yotsuya/',
      twitter: '@tipness_yotsuya',
      instagram: '@tipness_yotsuya',
      equipment: ['最新トレーニングマシン', 'プール(25m×4レーン)', 'スタジオ2面', 'ホットヨガスタジオ'],
      amenities: ['大浴場', 'サウナ', 'ジャグジー', 'エステサロン', 'プロショップ', '無料駐車場'],
      membership_fee: {
        monthly: '¥14,300',
        daily: '¥3,300'
      }
    },
    'gym-7': {
      id: 'gym-7',
      name: 'パーソナルジムRIZAP四谷店',
      description: '完全個室のマンツーマントレーニングで、確実な結果にコミット。専属トレーナーと管理栄養士による徹底サポートで理想の体型を実現。',
      prefecture: '東京都',
      city: '新宿区',
      address: '東京都新宿区四谷2-2-2 四谷二丁目ビル6F',
      latitude: 35.687234,
      longitude: 139.726543,
      image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=600&fit=crop&q=80',
      rating: 4.7,
      users_count: 145,
      opening_hours: '7:00-23:00',
      phone: '0120-700-900',
      website: 'https://www.rizap.jp/gym/yotsuya/',
      equipment: ['パワーラック', 'ダンベル各種', 'バランスボール', 'TRX'],
      amenities: ['個室トレーニングルーム', 'シャワールーム', 'アメニティ完備', '無料ウェアレンタル'],
      membership_fee: {
        monthly: '2ヶ月 ¥327,800〜'
      }
    },
    'gym-8': {
      id: 'gym-8',
      name: 'JOYFIT24 四谷',
      description: '四谷駅徒歩3分。24時間営業で、仕事帰りでも早朝でも自分のペースでトレーニング可能。最新のマシンと充実の設備で、初心者から上級者まで満足できる環境。',
      prefecture: '東京都',
      city: '新宿区',
      address: '東京都新宿区四谷1-15 アーバンビルサカス8 B1F',
      latitude: 35.686123,
      longitude: 139.728956,
      image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=600&fit=crop&q=80',
      rating: 4.5,
      users_count: 425,
      opening_hours: '24時間営業',
      phone: '03-6273-1234',
      website: 'https://joyfit.jp/yotsuya-main/',
      instagram: '@joyfit24_yotsuya_main',
      twitter: '@joyfit_yotsuya',
      equipment: ['パワーラック×3', 'スミスマシン×2', 'ダンベル(1kg~50kg)', 'プレートローディングマシン', 'カーディオマシン40台'],
      amenities: ['男女別シャワールーム', '個別ロッカー', 'タンニングマシン', '体組成計', 'プロテインバー', 'Wi-Fi完備'],
      membership_fee: {
        monthly: '¥8,379',
        daily: '¥2,500'
      }
    }
  }
}