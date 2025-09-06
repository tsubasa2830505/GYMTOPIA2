const { createClient } = require('@supabase/supabase-js');

// Supabase設定（環境変数から取得）
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addGymData() {
  try {
    console.log('🏢 Adding gym data...\n');
    
    // 新しいジムデータ
    const newGyms = [
      {
        name: 'ゴールドジム 原宿東京',
        name_kana: 'ゴールドジムハラジュクトウキョウ',
        description: 'プロボディビルダーも多く通う本格派ジム。フリーウェイトエリアが充実。',
        latitude: 35.669752,
        longitude: 139.702695,
        address: '東京都渋谷区神宮前6-31-17',
        prefecture: '東京都',
        city: '渋谷区',
        business_hours: {
          weekday: "7:00-23:00",
          saturday: "9:00-22:00",
          sunday: "9:00-20:00"
        },
        facilities: {
          parking: false,
          shower: true,
          locker: true,
          sauna: true,
          pool: false,
          personal_training: true
        },
        equipment_types: ['machine', 'free_weight', 'cardio'],
        machine_brands: ['Hammer Strength', 'Technogym', 'Matrix'],
        rating: 4.6,
        review_count: 98,
        verified: true
      },
      {
        name: 'エニタイムフィットネス 六本木',
        name_kana: 'エニタイムフィットネスロッポンギ',
        description: '24時間営業のフィットネスジム。世界中の店舗が利用可能。',
        latitude: 35.662836,
        longitude: 139.731329,
        address: '東京都港区六本木7-12-3',
        prefecture: '東京都',
        city: '港区',
        business_hours: { "24hours": true },
        facilities: {
          parking: false,
          shower: true,
          locker: true,
          sauna: false,
          pool: false,
          personal_training: false
        },
        equipment_types: ['machine', 'free_weight', 'cardio'],
        machine_brands: ['Life Fitness', 'Precor'],
        rating: 4.2,
        review_count: 67,
        verified: true
      },
      {
        name: 'RIZAP 新宿店',
        name_kana: 'ライザップシンジュクテン',
        description: '結果にコミットする完全個室のパーソナルトレーニングジム。',
        latitude: 35.689487,
        longitude: 139.700464,
        address: '東京都新宿区新宿3-17-20',
        prefecture: '東京都',
        city: '新宿区',
        business_hours: {
          weekday: "7:00-23:00",
          saturday: "7:00-23:00",
          sunday: "7:00-23:00"
        },
        facilities: {
          parking: false,
          shower: true,
          locker: true,
          sauna: false,
          pool: false,
          personal_training: true
        },
        equipment_types: ['machine', 'free_weight'],
        machine_brands: ['Technogym'],
        rating: 4.7,
        review_count: 45,
        verified: true
      },
      {
        name: 'ティップネス 渋谷',
        name_kana: 'ティップネスシブヤ',
        description: '総合フィットネスクラブ。プール、スタジオプログラムも充実。',
        latitude: 35.658998,
        longitude: 139.698682,
        address: '東京都渋谷区宇田川町16-4',
        prefecture: '東京都',
        city: '渋谷区',
        business_hours: {
          weekday: "7:00-23:00",
          saturday: "9:30-22:00",
          sunday: "9:30-20:00"
        },
        facilities: {
          parking: true,
          shower: true,
          locker: true,
          sauna: true,
          pool: true,
          personal_training: true
        },
        equipment_types: ['machine', 'free_weight', 'cardio'],
        machine_brands: ['Technogym', 'Life Fitness'],
        rating: 4.3,
        review_count: 156,
        verified: true
      },
      {
        name: 'コナミスポーツクラブ 池袋',
        name_kana: 'コナミスポーツクラブイケブクロ',
        description: '大型総合スポーツクラブ。温浴施設も完備。',
        latitude: 35.731702,
        longitude: 139.711085,
        address: '東京都豊島区東池袋1-41-30',
        prefecture: '東京都',
        city: '豊島区',
        business_hours: {
          weekday: "7:00-23:00",
          saturday: "10:00-22:00",
          sunday: "10:00-20:00"
        },
        facilities: {
          parking: true,
          shower: true,
          locker: true,
          sauna: true,
          pool: true,
          personal_training: true
        },
        equipment_types: ['machine', 'free_weight', 'cardio'],
        machine_brands: ['Technogym', 'Matrix', 'Life Fitness'],
        rating: 4.1,
        review_count: 203,
        verified: true
      }
    ];

    // ジムを追加
    for (const gym of newGyms) {
      console.log(`📍 Adding: ${gym.name}`);
      
      const { data, error } = await supabase
        .from('gyms')
        .upsert(gym, { onConflict: 'name' })
        .select();
      
      if (error) {
        console.log(`   ⚠️  Error: ${error.message}`);
      } else {
        console.log(`   ✅ Success`);
      }
    }
    
    // ジムにマシンを関連付け
    console.log('\n🔧 Linking machines to gyms...');
    
    // すべてのジムとマシンを取得
    const { data: gyms } = await supabase
      .from('gyms')
      .select('id, name')
      .in('name', newGyms.map(g => g.name));
    
    const { data: machines } = await supabase
      .from('machines')
      .select('id, type, target_category');
    
    if (gyms && machines) {
      const gymMachines = [];
      
      for (const gym of gyms) {
        // ジムのタイプに応じてマシンを選択
        let selectedMachines = machines;
        
        if (gym.name.includes('RIZAP')) {
          // RIZAPは基本的なマシンのみ
          selectedMachines = machines.filter(m => 
            ['chest-press', 'lat-pulldown', 'leg-press', 'smith-machine'].includes(m.id)
          );
        } else if (gym.name.includes('エニタイム')) {
          // エニタイムは主要なマシンのみ
          selectedMachines = machines.filter(m => 
            m.target_category && ['chest', 'back', 'legs'].includes(m.target_category)
          ).slice(0, 15);
        }
        
        // マシンを追加
        for (const machine of selectedMachines) {
          gymMachines.push({
            gym_id: gym.id,
            machine_id: machine.id,
            quantity: machine.type === 'free-weight' ? Math.floor(Math.random() * 3) + 2 : 1,
            condition: ['excellent', 'good', 'good', 'fair'][Math.floor(Math.random() * 4)]
          });
        }
      }
      
      // バッチ挿入
      if (gymMachines.length > 0) {
        const { error } = await supabase
          .from('gym_machines')
          .upsert(gymMachines, { onConflict: 'gym_id,machine_id' });
        
        if (error) {
          console.log(`   ⚠️  Error linking machines: ${error.message}`);
        } else {
          console.log(`   ✅ Linked ${gymMachines.length} machine-gym relationships`);
        }
      }
    }
    
    // 最終確認
    console.log('\n📊 Final verification:');
    const { count: gymCount } = await supabase
      .from('gyms')
      .select('*', { count: 'exact', head: true });
    
    const { count: machineCount } = await supabase
      .from('gym_machines')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   Total gyms: ${gymCount}`);
    console.log(`   Total gym-machine relationships: ${machineCount}`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// 実行
addGymData().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
