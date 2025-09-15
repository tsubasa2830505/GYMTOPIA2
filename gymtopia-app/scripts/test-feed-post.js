const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestPost() {
  try {
    console.log('Creating test user...');
    // テストユーザーを作成
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'test-gym-user@example.com',
      email_confirm: true,
      user_metadata: {
        display_name: 'ジム活テストユーザー',
        username: 'gym_test_user'
      }
    });

    if (userError) {
      console.error('Error creating user:', userError);
      // ユーザーが既に存在する場合は既存のユーザーを使用
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existingUser = users.find(u => u.email === 'test-gym-user@example.com');
      if (existingUser) {
        console.log('Using existing user:', existingUser.id);
        await createPost(existingUser.id);
      }
      return;
    }

    console.log('User created:', userData.user.id);
    await createPost(userData.user.id);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

async function createPost(userId) {
  console.log('Creating test post with image...');

  // テスト画像のURL（実際の画像URLに置き換える必要があります）
  const testImageUrl = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop';

  const postData = {
    user_id: userId,
    content: '🏋️ テスト投稿: 今日も素晴らしいトレーニングができました！\n\nベンチプレス: 80kg × 10回 × 3セット\nスクワット: 100kg × 8回 × 3セット\nデッドリフト: 120kg × 5回 × 3セット\n\n#ジム活 #筋トレ #フィットネス',
    images: [testImageUrl],
    training_details: {
      gym_name: 'テストジム渋谷店',
      exercises: [
        {
          name: 'ベンチプレス',
          weight: 80,
          sets: 3,
          reps: 10
        },
        {
          name: 'スクワット',
          weight: 100,
          sets: 3,
          reps: 8
        },
        {
          name: 'デッドリフト',
          weight: 120,
          sets: 3,
          reps: 5
        }
      ],
      crowd_status: 'normal',
      training_date: new Date().toISOString()
    }
  };

  const { data, error } = await supabase
    .from('posts')
    .insert([postData])
    .select('*, user:users(id, display_name, username, avatar_url)')
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return;
  }

  console.log('✅ Test post created successfully!');
  console.log('Post ID:', data.id);
  console.log('Content:', data.content);
  console.log('Images:', data.images);
  console.log('Training details:', JSON.stringify(data.training_details, null, 2));
  console.log('\nView the post in your feed at: http://localhost:3000/feed');
}

// 実行
createTestPost();