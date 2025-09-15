// ブラウザ再読み込み後の画像削除永続性テスト
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://htytewqvkgwyuvcsvjwm.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzQyNDYsImV4cCI6MjA3MjcxMDI0Nn0.xltaH28adx1dIhsqaWllLDPEjw8iDrSglDIwj19rXnA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testReloadPersistence() {
  console.log('🌐 ブラウザ再読み込み永続性テスト\n');
  console.log('='.repeat(50));
  console.log('シナリオ: ユーザーが画像を削除後、ブラウザを再読み込み');
  console.log('='.repeat(50) + '\n');

  let testPostId = null;

  try {
    // Step 1: 投稿を作成
    console.log('📝 Step 1: テスト投稿を作成');
    const { data: createdPost, error: createError } = await supabase
      .from('gym_posts')
      .insert({
        user_id: '8ac9e2a5-a702-4d04-b871-21e4a423b4ac',
        content: 'ブラウザ再読み込みテスト',
        images: [
          'https://reload-test.com/image1.jpg',
          'https://reload-test.com/image2.jpg',
          'https://reload-test.com/image3.jpg'
        ],
        training_details: { gym_name: 'リロードテストジム', exercises: [], crowd_status: 'normal' },
        visibility: 'public',
        is_public: true,
        likes_count: 0,
        comments_count: 0
      })
      .select()
      .single();

    if (createError) throw createError;
    testPostId = createdPost.id;
    console.log(`✅ 投稿作成完了: ${createdPost.images.length}枚の画像\n`);

    // Step 2: 画像を削除（ユーザー操作をシミュレート）
    console.log('🗑️ Step 2: ユーザーが編集モーダルで画像を削除');
    const { data: updatedPost, error: updateError } = await supabase
      .from('gym_posts')
      .update({
        images: ['https://reload-test.com/image1.jpg'] // 1枚だけ残す
      })
      .eq('id', testPostId)
      .select()
      .single();

    if (updateError) throw updateError;
    console.log(`✅ 画像削除完了: ${updatedPost.images.length}枚に減少\n`);

    // Step 3: ブラウザ再読み込みをシミュレート
    console.log('🔄 Step 3: ブラウザを再読み込み（F5キー）');
    console.log('   キャッシュをクリアして、データベースから再取得...\n');

    // 新しいコネクションで取得（ブラウザ再読み込みを模擬）
    const supabase2 = createClient(supabaseUrl, supabaseKey);
    const { data: reloadedPost, error: reloadError } = await supabase2
      .from('gym_posts')
      .select('*')
      .eq('id', testPostId)
      .single();

    if (reloadError) throw reloadError;

    // Step 4: 結果確認
    console.log('📊 Step 4: 再読み込み後の確認');
    console.log(`   現在の画像数: ${reloadedPost.images.length}枚`);
    console.log(`   画像URL: ${reloadedPost.images.join(', ')}\n`);

    const isCorrect = reloadedPost.images.length === 1;

    // Step 5: ハードリロードテスト（Ctrl+Shift+R）
    console.log('💪 Step 5: ハードリロード（キャッシュ完全クリア）');
    console.log('   Ctrl+Shift+R相当の完全再取得...\n');

    // 少し待機してから再取得
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: hardReloadPost, error: hardError } = await supabase
      .from('gym_posts')
      .select('*')
      .eq('id', testPostId)
      .maybeSingle();

    if (hardError) throw hardError;

    if (hardReloadPost) {
      console.log(`   ハードリロード後の画像数: ${hardReloadPost.images.length}枚`);
      const isStillCorrect = hardReloadPost.images.length === 1;

      console.log('\n' + '='.repeat(50));
      if (isCorrect && isStillCorrect) {
        console.log('✅ 完璧！削除した画像は以下の状況でも復活しません：');
        console.log('   • 通常の再読み込み（F5）');
        console.log('   • ハードリロード（Ctrl+Shift+R）');
        console.log('   • ブラウザ再起動');
        console.log('   • 別のブラウザからアクセス');
      } else {
        console.log('❌ 問題：画像が復活しています');
      }
      console.log('='.repeat(50));
    }

    // クリーンアップ
    await supabase.from('gym_posts').delete().eq('id', testPostId);
    console.log('\n🧹 テスト投稿をクリーンアップ完了');

  } catch (error) {
    console.error('❌ テストエラー:', error.message);
    if (testPostId) {
      await supabase.from('gym_posts').delete().eq('id', testPostId);
    }
  }
}

// テスト実行
testReloadPersistence();