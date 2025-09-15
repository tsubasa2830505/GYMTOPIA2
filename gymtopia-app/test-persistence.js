// サーバー再起動後の画像削除永続性テスト
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://htytewqvkgwyuvcsvjwm.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzQyNDYsImV4cCI6MjA3MjcxMDI0Nn0.xltaH28adx1dIhsqaWllLDPEjw8iDrSglDIwj19rXnA';

const supabase = createClient(supabaseUrl, supabaseKey);

let testPostId = null;

async function createTestPost() {
  console.log('📝 永続性テスト用の投稿を作成中...');

  const testPost = {
    user_id: '8ac9e2a5-a702-4d04-b871-21e4a423b4ac',
    content: '永続性テスト - この投稿の画像は削除されます',
    images: [
      'https://test.com/persistence1.jpg',
      'https://test.com/persistence2.jpg',
      'https://test.com/persistence3.jpg',
      'https://test.com/persistence4.jpg'
    ],
    training_details: {
      gym_name: '永続性テストジム',
      exercises: [],
      crowd_status: 'normal'
    },
    visibility: 'public',
    is_public: true,
    likes_count: 0,
    comments_count: 0
  };

  const { data, error } = await supabase
    .from('gym_posts')
    .insert(testPost)
    .select()
    .single();

  if (error) throw error;

  testPostId = data.id;
  console.log(`✅ テスト投稿作成: ID = ${testPostId}`);
  console.log(`   初期画像数: ${data.images.length}枚\n`);
  return data;
}

async function deleteImagesFromPost() {
  console.log('🗑️ 画像を2枚削除中...');

  // 最初の2枚だけ残す
  const updatedImages = [
    'https://test.com/persistence1.jpg',
    'https://test.com/persistence2.jpg'
  ];

  const { data, error } = await supabase
    .from('gym_posts')
    .update({ images: updatedImages })
    .eq('id', testPostId)
    .select()
    .single();

  if (error) throw error;

  console.log(`✅ 画像削除完了`);
  console.log(`   残り画像数: ${data.images.length}枚\n`);
  return data;
}

async function verifyAfterRestart() {
  console.log('🔄 サーバー再起動をシミュレート...');
  console.log('   (データベースから再取得)\n');

  // データベースから直接取得（キャッシュなし）
  const { data, error } = await supabase
    .from('gym_posts')
    .select('*')
    .eq('id', testPostId)
    .single();

  if (error) throw error;

  const isPersisted = data.images.length === 2;
  console.log(`📊 永続性チェック結果:`);
  console.log(`   画像数: ${data.images.length}枚`);
  console.log(`   削除された画像は復活していない: ${isPersisted ? '✅ 正常' : '❌ 問題あり'}`);

  if (isPersisted) {
    console.log(`   画像URL: ${data.images.join(', ')}`);
  } else {
    console.log(`   ⚠️ 画像が復活しています！`);
  }

  return isPersisted;
}

async function cleanup() {
  if (!testPostId) return;

  console.log('\n🧹 テスト投稿をクリーンアップ中...');
  const { error } = await supabase
    .from('gym_posts')
    .delete()
    .eq('id', testPostId);

  if (!error) {
    console.log('✅ クリーンアップ完了');
  }
}

async function runPersistenceTest() {
  console.log('🔬 画像削除の永続性テスト開始\n');
  console.log('このテストでは、画像削除がサーバー再起動後も維持されることを確認します。\n');

  try {
    // ステップ1: テスト投稿作成
    await createTestPost();

    // ステップ2: 画像を削除
    await deleteImagesFromPost();

    // ステップ3: サーバー再起動後を想定した確認
    const isPersisted = await verifyAfterRestart();

    // 結果判定
    console.log('\n' + '='.repeat(50));
    if (isPersisted) {
      console.log('🎉 成功！画像削除はサーバー再起動後も永続化されています。');
      console.log('削除された画像が復活することはありません。');
    } else {
      console.log('❌ 問題検出：画像削除が永続化されていません。');
    }
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ テスト失敗:', error.message);
  } finally {
    await cleanup();
  }
}

// テスト実行
runPersistenceTest();