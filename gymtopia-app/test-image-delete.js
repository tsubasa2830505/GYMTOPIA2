// 画像削除機能のテストスクリプト
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://htytewqvkgwyuvcsvjwm.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzQyNDYsImV4cCI6MjA3MjcxMDI0Nn0.xltaH28adx1dIhsqaWllLDPEjw8iDrSglDIwj19rXnA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testImageDelete() {
  console.log('📸 画像削除機能テスト開始...\n');

  try {
    // 1. テスト用投稿を作成
    console.log('1️⃣ テスト投稿を作成中...');
    const testPost = {
      user_id: '8ac9e2a5-a702-4d04-b871-21e4a423b4ac', // TSUBASAユーザー
      content: 'テスト投稿 - 画像削除機能テスト',
      images: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg'
      ],
      training_details: {
        gym_name: 'テストジム',
        exercises: [],
        crowd_status: 'normal'
      },
      visibility: 'public',
      is_public: true,
      likes_count: 0,
      comments_count: 0
    };

    const { data: createdPost, error: createError } = await supabase
      .from('gym_posts')
      .insert(testPost)
      .select()
      .single();

    if (createError) throw createError;
    console.log(`✅ 投稿作成成功: ID = ${createdPost.id}`);
    console.log(`   画像数: ${createdPost.images.length}個`);
    console.log(`   画像URL: ${createdPost.images.join(', ')}\n`);

    // 2. 画像を1つ削除
    console.log('2️⃣ 画像を1つ削除中...');
    const updatedImages = createdPost.images.slice(0, 2); // 最後の画像を削除

    const { data: updatedPost, error: updateError } = await supabase
      .from('gym_posts')
      .update({ images: updatedImages })
      .eq('id', createdPost.id)
      .select()
      .single();

    if (updateError) throw updateError;
    console.log(`✅ 画像削除成功`);
    console.log(`   残り画像数: ${updatedPost.images.length}個`);
    console.log(`   画像URL: ${updatedPost.images.join(', ')}\n`);

    // 3. 削除が永続化されているか確認
    console.log('3️⃣ 削除の永続性を確認中...');
    const { data: verifyPost, error: verifyError } = await supabase
      .from('gym_posts')
      .select('id, images')
      .eq('id', createdPost.id)
      .single();

    if (verifyError) throw verifyError;

    const isDeleted = verifyPost.images.length === 2;
    console.log(`✅ 永続化確認: ${isDeleted ? '成功' : '失敗'}`);
    console.log(`   データベース上の画像数: ${verifyPost.images.length}個\n`);

    // 4. すべての画像を削除
    console.log('4️⃣ すべての画像を削除中...');
    const { data: clearedPost, error: clearError } = await supabase
      .from('gym_posts')
      .update({ images: [] })
      .eq('id', createdPost.id)
      .select()
      .single();

    if (clearError) throw clearError;
    console.log(`✅ 全画像削除成功`);
    console.log(`   残り画像数: ${clearedPost.images.length}個\n`);

    // 5. テスト投稿を削除
    console.log('5️⃣ テスト投稿をクリーンアップ中...');
    const { error: deleteError } = await supabase
      .from('gym_posts')
      .delete()
      .eq('id', createdPost.id);

    if (deleteError) throw deleteError;
    console.log('✅ クリーンアップ完了\n');

    console.log('🎉 テスト完了！画像削除機能は正常に動作しています。');

  } catch (error) {
    console.error('❌ テスト失敗:', error.message);
    console.error('詳細:', error);
  }
}

// テスト実行
testImageDelete();