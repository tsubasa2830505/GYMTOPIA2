const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Supabase設定（環境変数から取得）
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSampleData() {
  try {
    console.log('🎭 Creating sample data for GYMTOPIA 2.0...\n');
    
    // 1. テストユーザーを作成
    console.log('👤 Creating test users...');
    
    const testUsers = [
      {
        id: uuidv4(),
        email: 'taro@example.com',
        username: 'muscle_taro',
        display_name: '山田太郎'
      },
      {
        id: uuidv4(),
        email: 'hanako@example.com',
        username: 'fit_hanako',
        display_name: '佐藤花子'
      },
      {
        id: uuidv4(),
        email: 'ichiro@example.com',
        username: 'power_ichiro',
        display_name: '鈴木一郎'
      },
      {
        id: uuidv4(),
        email: 'yuki@example.com',
        username: 'cardio_yuki',
        display_name: '高橋ゆき'
      },
      {
        id: uuidv4(),
        email: 'kenji@example.com',
        username: 'bulk_kenji',
        display_name: '田中健司'
      }
    ];
    
    // まず既存のユーザーを確認
    const { data: existingUsers } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    let users = existingUsers || [];
    
    // 既存ユーザーがない場合はテストユーザーをAuthで作成
    if (!users || users.length === 0) {
      console.log('   ℹ️  No existing users found. Creating test users via Auth...');
      
      for (const testUser of testUsers) {
        // Supabase Authでユーザーを作成
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: testUser.email,
          password: 'password123', // テスト用パスワード
          email_confirm: true,
          user_metadata: {
            username: testUser.username,
            display_name: testUser.display_name
          }
        });
        
        if (authError) {
          console.log(`   ⚠️  Error creating auth user ${testUser.email}: ${authError.message}`);
          continue;
        }
        
        if (authUser && authUser.user) {
          // usersテーブルにレコードを作成
          const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
              id: authUser.user.id,
              email: testUser.email,
              username: testUser.username,
              display_name: testUser.display_name
            })
            .select()
            .single();
          
          if (!userError && newUser) {
            users.push(newUser);
          }
        }
      }
    }
    console.log(`   ✅ Created ${users.length} test users`);
    
    // ユーザープロファイルを作成
    const userProfiles = users.map((user, index) => ({
      user_id: user.id,
      bio: [
        '筋トレ歴3年｜ベンチプレス100kg目標｜週4トレーニング',
        '朝トレ派｜ダイエット&ボディメイク｜ヨガも好き',
        'パワーリフター｜BIG3合計500kg｜大会出場経験あり',
        'ランニング&筋トレ｜フルマラソン完走目標｜健康第一',
        '増量期真っ最中｜目標体重80kg｜食事も大事'
      ][index],
      height: 165 + Math.floor(Math.random() * 20),
      weight: 60 + Math.floor(Math.random() * 30),
      body_fat_percentage: 10 + Math.floor(Math.random() * 15),
      bench_press_max: 40 + Math.floor(Math.random() * 80),
      squat_max: 60 + Math.floor(Math.random() * 100),
      deadlift_max: 70 + Math.floor(Math.random() * 110)
    }));
    
    await supabase
      .from('user_profiles')
      .upsert(userProfiles, { onConflict: 'user_id' });
    
    // 2. ジムメンバーシップを作成
    console.log('\n🏢 Creating gym memberships...');
    
    const { data: gyms } = await supabase
      .from('gyms')
      .select('id, name')
      .limit(5);
    
    if (gyms && gyms.length > 0) {
      const memberships = [];
      
      // 各ユーザーをランダムなジムに登録
      users.forEach((user, index) => {
        const gym = gyms[index % gyms.length];
        memberships.push({
          user_id: user.id,
          gym_id: gym.id,
          membership_type: ['regular', 'premium', 'vip'][Math.floor(Math.random() * 3)],
          status: 'active',
          start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 3ヶ月前
        });
      });
      
      await supabase
        .from('gym_memberships')
        .upsert(memberships, { onConflict: 'user_id,gym_id,status' });
      
      console.log(`   ✅ Created ${memberships.length} gym memberships`);
    }
    
    // 3. ワークアウトセッションを作成
    console.log('\n💪 Creating workout sessions...');
    
    const workoutSessions = [];
    const workoutExercises = [];
    
    for (const user of users.slice(0, 3)) { // 最初の3人のユーザーにワークアウトを作成
      for (let i = 0; i < 5; i++) { // 各ユーザーに5つのセッション
        const sessionId = uuidv4();
        const sessionDate = new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000); // 2日おき
        
        workoutSessions.push({
          id: sessionId,
          user_id: user.id,
          gym_id: gyms ? gyms[0].id : null,
          name: ['胸の日', '背中の日', '脚の日', '肩の日', '腕の日'][i % 5],
          target_muscles: [
            ['chest', 'triceps'],
            ['back', 'biceps'],
            ['legs'],
            ['shoulder'],
            ['arms']
          ][i % 5],
          started_at: sessionDate,
          ended_at: new Date(sessionDate.getTime() + 60 * 60 * 1000), // 1時間後
          duration_minutes: 60,
          mood: ['excellent', 'good', 'normal'][Math.floor(Math.random() * 3)]
        });
        
        // エクササイズを追加
        const exerciseCount = 3 + Math.floor(Math.random() * 3);
        for (let j = 0; j < exerciseCount; j++) {
          workoutExercises.push({
            id: uuidv4(),
            session_id: sessionId,
            exercise_name: ['ベンチプレス', 'スクワット', 'デッドリフト', 'ショルダープレス', 'ラットプルダウン'][Math.floor(Math.random() * 5)],
            exercise_order: j + 1,
            sets: [
              { reps: 10, weight: 60, rest_seconds: 90 },
              { reps: 8, weight: 70, rest_seconds: 90 },
              { reps: 6, weight: 80, rest_seconds: 120 }
            ]
          });
        }
      }
    }
    
    await supabase.from('workout_sessions').upsert(workoutSessions);
    await supabase.from('workout_exercises').upsert(workoutExercises);
    
    console.log(`   ✅ Created ${workoutSessions.length} workout sessions`);
    console.log(`   ✅ Created ${workoutExercises.length} exercises`);
    
    // 4. 投稿を作成
    console.log('\n📝 Creating posts...');
    
    const posts = [];
    
    // 通常の投稿
    posts.push({
      id: uuidv4(),
      user_id: users[0].id,
      content: '今日も朝トレ完了！最高の1日のスタート💪',
      post_type: 'normal',
      visibility: 'public'
    });
    
    // ワークアウト投稿
    posts.push({
      id: uuidv4(),
      user_id: users[1].id,
      content: 'ベンチプレス自己ベスト更新！80kg×5レップス達成🎯',
      post_type: 'achievement',
      achievement_type: 'pr',
      achievement_data: { exercise: 'ベンチプレス', weight: 80, reps: 5 },
      visibility: 'public'
    });
    
    // チェックイン投稿
    posts.push({
      id: uuidv4(),
      user_id: users[2].id,
      content: 'ゴールドジム渋谷なう。今日は脚の日！',
      post_type: 'check_in',
      gym_id: gyms ? gyms[0].id : null,
      visibility: 'public'
    });
    
    // ワークアウト完了投稿
    posts.push({
      id: uuidv4(),
      user_id: users[0].id,
      content: '胸トレ完了！パンプ最高😤\n\nベンチプレス: 80kg×8×3\nインクラインダンベル: 30kg×10×3\nケーブルフライ: 15kg×15×3',
      post_type: 'workout',
      workout_session_id: workoutSessions.length > 0 ? workoutSessions[0].id : null,
      visibility: 'public'
    });
    
    const { data: insertedPosts } = await supabase
      .from('posts')
      .upsert(posts)
      .select();
    
    console.log(`   ✅ Created ${posts.length} posts`);
    
    // 5. いいねを作成
    console.log('\n❤️ Creating likes...');
    
    const likes = [];
    if (insertedPosts) {
      // 各投稿にランダムにいいね
      for (const post of insertedPosts) {
        const likerCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < likerCount && i < users.length; i++) {
          if (users[i].id !== post.user_id) { // 自分の投稿にはいいねしない
            likes.push({
              user_id: users[i].id,
              post_id: post.id
            });
          }
        }
      }
    }
    
    await supabase.from('likes').upsert(likes);
    console.log(`   ✅ Created ${likes.length} likes`);
    
    // 6. コメントを作成
    console.log('\n💬 Creating comments...');
    
    const comments = [];
    if (insertedPosts && insertedPosts.length > 0) {
      comments.push({
        user_id: users[1].id,
        post_id: insertedPosts[0].id,
        content: 'お疲れ様！朝トレ最高ですよね👍'
      });
      
      comments.push({
        user_id: users[2].id,
        post_id: insertedPosts[1].id,
        content: 'すごい！おめでとうございます🎉'
      });
    }
    
    await supabase.from('comments').upsert(comments);
    console.log(`   ✅ Created ${comments.length} comments`);
    
    // 7. フォロー関係を作成
    console.log('\n👥 Creating follow relationships...');
    
    const follows = [
      { follower_id: users[0].id, following_id: users[1].id },
      { follower_id: users[0].id, following_id: users[2].id },
      { follower_id: users[1].id, following_id: users[0].id },
      { follower_id: users[1].id, following_id: users[3].id },
      { follower_id: users[2].id, following_id: users[0].id },
      { follower_id: users[3].id, following_id: users[1].id },
      { follower_id: users[4].id, following_id: users[0].id }
    ];
    
    await supabase.from('follows').upsert(follows);
    console.log(`   ✅ Created ${follows.length} follow relationships`);
    
    // 8. ジム友達関係を作成
    console.log('\n🤝 Creating gym friendships...');
    
    const gymFriends = [
      {
        user_id: users[0].id,
        friend_id: users[1].id,
        status: 'accepted',
        common_gym_id: gyms ? gyms[0].id : null,
        accepted_at: new Date()
      },
      {
        user_id: users[2].id,
        friend_id: users[3].id,
        status: 'accepted',
        common_gym_id: gyms ? gyms[0].id : null,
        accepted_at: new Date()
      },
      {
        user_id: users[0].id,
        friend_id: users[4].id,
        status: 'pending',
        common_gym_id: gyms ? gyms[0].id : null
      }
    ];
    
    await supabase.from('gym_friends').upsert(gymFriends);
    console.log(`   ✅ Created ${gymFriends.length} gym friendships`);
    
    // 最終サマリー
    console.log('\n' + '='.repeat(50));
    console.log('📊 Sample Data Summary:');
    console.log(`   👤 Users: ${users.length}`);
    console.log(`   🏢 Memberships: ${memberships?.length || 0}`);
    console.log(`   💪 Workout Sessions: ${workoutSessions.length}`);
    console.log(`   📝 Posts: ${posts.length}`);
    console.log(`   ❤️ Likes: ${likes.length}`);
    console.log(`   💬 Comments: ${comments.length}`);
    console.log(`   👥 Follows: ${follows.length}`);
    console.log(`   🤝 Gym Friends: ${gymFriends.length}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// 実行
createSampleData().then(() => {
  console.log('\n✨ Sample data creation complete!');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
