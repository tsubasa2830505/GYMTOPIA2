import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://htytewqvkgwyuvcsvjwm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEzNDI0NiwiZXhwIjoyMDcyNzEwMjQ2fQ.VVNIX12yaN7t3seEzRwbMRtmNEbHoEkPXYeBzt60JBs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkGyms() {
  try {
    console.log('🔍 Checking existing gyms...')
    const { data: gyms, error } = await supabase
      .from('gyms')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('❌ Error:', error)
      return
    }
    
    console.log('📍 Found', gyms.length, 'gyms:')
    gyms.forEach(gym => {
      console.log(`- ${gym.name} (ID: ${gym.id})`)
    })
    
    // Check if gym-1 exists
    const { data: gym1, error: gym1Error } = await supabase
      .from('gyms')
      .select('*')
      .eq('id', 'gym-1')
      .single()
    
    if (gym1Error && gym1Error.code !== 'PGRST116') {
      console.error('❌ Error checking gym-1:', gym1Error)
      return
    }
    
    if (!gym1) {
      console.log('➕ Adding sample gym data...')
      await addSampleGyms()
    } else {
      console.log('✅ Sample gym data already exists')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

async function addSampleGyms() {
  const sampleGyms = [
    {
      id: 'gym-1',
      name: 'ゴールドジム渋谷',
      description: '本格的なトレーニング設備が充実した、日本最大級のフィットネスジム。初心者から上級者まで、すべてのトレーニーのニーズに応える設備とサービスを提供しています。',
      prefecture: '東京都',
      city: '渋谷区',
      address: '東京都渋谷区渋谷1-23-16 ココチビル4F',
      latitude: 35.659025,
      longitude: 139.703473,
      images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=600&fit=crop&q=80'],
      rating: 4.5,
      review_count: 523,
      business_hours: '平日 7:00-23:00 / 土日祝 9:00-20:00',
      phone: '03-1234-5678',
      website: 'https://www.goldsgym.jp/shop/13120',
      instagram: '@goldsgym_shibuya',
      twitter: '@goldsgym_shibuya',
      equipment_types: ['machine', 'free_weight', 'cardio'],
      facilities: {
        shower: true,
        locker: true,
        parking: true,
        sauna: false,
        pool: false,
        studio: false,
        personal_training: true
      },
      price_info: {
        monthly: '¥11,000',
        daily: '¥2,750'
      }
    },
    {
      id: 'gym-2',
      name: 'エニタイムフィットネス四谷三丁目店',
      description: '24時間年中無休のマシン特化型ジム。シンプルで効率的なトレーニング環境を提供。世界中のエニタイムが利用可能で、出張や旅行先でもトレーニングを継続できます。',
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
      website: 'https://www.anytimefitness.co.jp/gym/1234/',
      equipment_types: ['machine', 'free_weight', 'cardio'],
      facilities: {
        shower: true,
        locker: true,
        parking: false,
        sauna: false,
        pool: false,
        studio: false,
        "24hours": true
      },
      price_info: {
        monthly: '¥7,920',
        daily: '¥2,200'
      }
    }
  ]

  try {
    const { data, error } = await supabase
      .from('gyms')
      .insert(sampleGyms)
    
    if (error) {
      console.error('❌ Error inserting gyms:', error)
      return
    }
    
    console.log('✅ Successfully added sample gym data')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkGyms()
