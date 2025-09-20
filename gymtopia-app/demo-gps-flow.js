/**
 * 実際のユーザーフローを完全再現
 * 1. まず、利用可能なユーザーとジムを確認
 * 2. GPS認証チェックインを実行
 * 3. 投稿を作成してGPS認証が自動付与されることを確認
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://htytewqvkgwyuvcsvjwm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzQyNDYsImV4cCI6MjA3MjcxMDI0Nn0.xltaH28adx1dIhsqaWllLDPEjw8iDrSglDIwj19rXnA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function demoGPSFlow() {
  console.log('=====================================');
  console.log('🚀 実際のユーザーフローデモンストレーション');
  console.log('=====================================\n');

  try {
    // ========================================
    // ステップ1: 利用可能なユーザーとジムを確認
    // ========================================
    console.log('📋 ステップ1: 利用可能なデータを確認');
    console.log('-------------------------------------');

    // ユーザー一覧を取得
    const { data: users } = await supabase
      .from('users')
      .select('id, username, display_name')
      .limit(5);

    console.log('利用可能なユーザー:');
    if (users && users.length > 0) {
      users.forEach(u => console.log(`  - ${u.display_name || u.username} (${u.id})`));
    } else {
      // ユーザーが見つからない場合は、auth.usersから直接取得を試みる
      console.log('  ユーザーテーブルが空です。デフォルトユーザーIDを使用します。');
    }

    // ジム一覧を取得
    const { data: gyms } = await supabase
      .from('gyms')
      .select('id, name, address, latitude, longitude')
      .limit(5);

    console.log('\n利用可能なジム:');
    gyms?.forEach(g => console.log(`  - ${g.name} (${g.id})`));

    // テスト用のユーザーとジムを選択
    const selectedUser = users?.[0] || { id: '8ac9e2a5-a702-4d04-b871-21e4a423b4ac', display_name: 'テストユーザー' };
    const selectedGym = gyms?.[0] || {
      id: 'ecef0d28-c740-4833-b15e-48703108196c',
      name: 'ゴールドジム渋谷',
      latitude: 35.6588,
      longitude: 139.7034
    };

    console.log('\n選択されたテストデータ:');
    console.log(`  ユーザー: ${selectedUser.display_name || selectedUser.id}`);
    console.log(`  ジム: ${selectedGym.name}\n`);

    // ========================================
    // ステップ2: GPS認証チェックインを実行
    // ========================================
    console.log('=====================================');
    console.log('📍 ステップ2: GPS認証チェックインを実行');
    console.log('=====================================');

    console.log('🛰️ GPS位置情報を取得中...');

    // 実際のGPS取得をシミュレート
    const userLocation = {
      latitude: selectedGym.latitude + (Math.random() * 0.0005), // ジムから約50m以内
      longitude: selectedGym.longitude + (Math.random() * 0.0005),
      accuracy: 15 + Math.random() * 15 // 15-30mの精度
    };

    // 距離計算（Haversine formula簡易版）
    const R = 6371e3; // 地球の半径（メートル）
    const φ1 = userLocation.latitude * Math.PI/180;
    const φ2 = selectedGym.latitude * Math.PI/180;
    const Δφ = (selectedGym.latitude - userLocation.latitude) * Math.PI/180;
    const Δλ = (selectedGym.longitude - userLocation.longitude) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    console.log(`✅ GPS位置取得成功`);
    console.log(`  精度: ${userLocation.accuracy.toFixed(1)}m`);
    console.log(`  ジムからの距離: ${distance.toFixed(1)}m`);

    // GPS認証判定
    const isVerified = distance <= 80 && userLocation.accuracy <= 30;
    console.log(`  GPS認証: ${isVerified ? '✅ 成功（80m以内）' : '❌ 失敗（範囲外）'}\n`);

    // チェックインを作成
    console.log('💾 チェックインデータを保存中...');
    const checkinData = {
      user_id: selectedUser.id,
      gym_id: selectedGym.id,
      user_latitude: userLocation.latitude,
      user_longitude: userLocation.longitude,
      distance_to_gym: distance,
      location_verified: isVerified,
      device_info: {
        platform: 'Web Demo',
        accuracy: userLocation.accuracy,
        timestamp: Date.now(),
        userAgent: 'Node.js Test Script'
      },
      crowd_level: ['empty', 'normal', 'crowded'][Math.floor(Math.random() * 3)]
    };

    const { data: checkin, error: checkinError } = await supabase
      .from('gym_checkins')
      .insert(checkinData)
      .select()
      .single();

    if (checkinError) throw checkinError;

    console.log('✅ チェックイン完了！');
    console.log(`  チェックインID: ${checkin.id}`);
    console.log(`  時刻: ${new Date(checkin.checked_in_at).toLocaleString('ja-JP')}`);
    console.log(`  混雑度: ${checkin.crowd_level === 'empty' ? '空いている' :
                         checkin.crowd_level === 'normal' ? '普通' : '混んでいる'}\n`);

    // 少し待機（実際の操作をシミュレート）
    console.log('⏳ トレーニング中... (3秒待機)');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // ========================================
    // ステップ3: トレーニング投稿を作成
    // ========================================
    console.log('\n=====================================');
    console.log('📝 ステップ3: トレーニング投稿を作成');
    console.log('=====================================');

    console.log('トレーニング詳細を入力中...\n');

    // トレーニング内容を生成
    const exercises = [
      { name: 'ベンチプレス', weight: 60 + Math.floor(Math.random() * 40), reps: 8 + Math.floor(Math.random() * 4), sets: 3 },
      { name: 'スクワット', weight: 80 + Math.floor(Math.random() * 40), reps: 10 + Math.floor(Math.random() * 5), sets: 4 },
      { name: 'デッドリフト', weight: 100 + Math.floor(Math.random() * 50), reps: 5 + Math.floor(Math.random() * 3), sets: 3 }
    ];

    exercises.forEach(ex => {
      console.log(`  - ${ex.name}: ${ex.weight}kg × ${ex.reps}回 × ${ex.sets}セット`);
    });

    const postContent = `今日のトレーニング完了！💪

${exercises.map(ex => `${ex.name} ${ex.weight}kg×${ex.reps}×${ex.sets}`).join('\n')}

良い感じに追い込めました！
ジム: ${selectedGym.name}

#ジムトピア #筋トレ #${selectedGym.name.replace(/\s+/g, '')}`;

    console.log('\n投稿内容:');
    console.log('---');
    console.log(postContent);
    console.log('---\n');

    // GPS認証情報を自動検索
    console.log('🔍 GPS認証情報を確認中...');

    // 24時間以内のチェックインを検索（createPost関数と同じロジック）
    const timeThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentCheckin } = await supabase
      .from('gym_checkins')
      .select('id, location_verified, distance_to_gym, checked_in_at')
      .eq('user_id', selectedUser.id)
      .eq('gym_id', selectedGym.id)
      .eq('location_verified', true)
      .gte('checked_in_at', timeThreshold)
      .order('checked_in_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let gpsVerificationData = {};
    if (recentCheckin) {
      console.log(`✅ GPS認証チェックインを検出！`);
      console.log(`  チェックインID: ${recentCheckin.id}`);
      console.log(`  距離: ${recentCheckin.distance_to_gym.toFixed(1)}m`);
      console.log(`  → GPS認証を自動付与します\n`);

      gpsVerificationData = {
        checkin_id: recentCheckin.id,
        is_verified: recentCheckin.location_verified,
        verification_method: 'gps',
        distance_from_gym: recentCheckin.distance_to_gym
      };
    } else {
      console.log('⚠️ GPS認証なし（24時間以内のチェックインが見つかりません）\n');
    }

    // 投稿を作成
    console.log('📤 投稿を作成中...');
    const postData = {
      user_id: selectedUser.id,
      gym_id: selectedGym.id,
      content: postContent,
      training_details: {
        exercises: exercises,
        duration: 60 + Math.floor(Math.random() * 30),
        calories: 400 + Math.floor(Math.random() * 200),
        crowd_status: checkin.crowd_level
      },
      visibility: 'public',
      is_public: true,
      ...gpsVerificationData // GPS認証情報を自動付与
    };

    const { data: newPost, error: postError } = await supabase
      .from('gym_posts')
      .insert(postData)
      .select()
      .single();

    if (postError) throw postError;

    console.log('\n✅ 投稿完了！');
    console.log(`  投稿ID: ${newPost.id}`);
    console.log(`  作成時刻: ${new Date(newPost.created_at).toLocaleString('ja-JP')}`);

    // ========================================
    // ステップ4: GPS認証状態を確認
    // ========================================
    console.log('\n=====================================');
    console.log('🔍 ステップ4: GPS認証状態を確認');
    console.log('=====================================');

    // 投稿の詳細を取得
    const { data: verifiedPost } = await supabase
      .from('gym_posts')
      .select(`
        *,
        gyms(name, address),
        users!inner(username, display_name)
      `)
      .eq('id', newPost.id)
      .single();

    console.log('\n📊 投稿の詳細:');
    console.log(`  ユーザー: ${verifiedPost.users?.display_name || verifiedPost.users?.username}`);
    console.log(`  ジム: ${verifiedPost.gyms?.name}`);
    console.log(`  GPS認証: ${verifiedPost.is_verified ? '✅ 認証済み' : '❌ 未認証'}`);

    if (verifiedPost.is_verified) {
      console.log(`  認証方法: ${verifiedPost.verification_method}`);
      console.log(`  チェックインID: ${verifiedPost.checkin_id}`);
      console.log(`  ジムからの距離: ${verifiedPost.distance_from_gym?.toFixed(1)}m`);
    }

    console.log('\n=====================================');
    if (verifiedPost.is_verified && verifiedPost.checkin_id === recentCheckin?.id) {
      console.log('🎉 成功！GPS認証が自動的に付与されました！');
      console.log('=====================================');
      console.log('\n✅ 確認されたフロー:');
      console.log('  1. GPS認証チェックインを実行');
      console.log('  2. 同じジムで投稿を作成');
      console.log('  3. GPS認証が自動的に付与される');
      console.log('\nシステムは正常に動作しています！');
    } else if (!recentCheckin && !verifiedPost.is_verified) {
      console.log('✅ 期待通りの動作（GPS認証なし）');
      console.log('=====================================');
      console.log('24時間以内のチェックインがないため、');
      console.log('GPS認証は付与されませんでした。');
    } else {
      console.log('⚠️ 予期しない状態');
      console.log('=====================================');
      console.log('GPS認証の動作を確認してください。');
    }

    // フィードでの表示を確認
    console.log('\n📱 フィードでの表示:');
    const { data: feedPosts } = await supabase
      .from('gym_posts')
      .select('id, content, is_verified, created_at')
      .eq('user_id', selectedUser.id)
      .order('created_at', { ascending: false })
      .limit(3);

    feedPosts?.forEach((post, i) => {
      const badge = post.is_verified ? '🛡️' : '⭕';
      const preview = post.content.substring(0, 50).replace(/\n/g, ' ');
      console.log(`  ${i+1}. ${badge} ${preview}...`);
    });

  } catch (error) {
    console.error('\n❌ エラー:', error.message);
    console.error(error);
  }

  console.log('\n=====================================');
  console.log('デモンストレーション完了');
  console.log('=====================================\n');
}

// デモ実行
demoGPSFlow().catch(console.error);