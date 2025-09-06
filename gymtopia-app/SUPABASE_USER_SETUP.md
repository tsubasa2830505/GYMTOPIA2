# 🔐 Supabase ユーザーシステム セットアップガイド

## 📋 概要
GYMTOPIA 2.0のユーザー認証・プロフィール・ソーシャル機能の実装ガイド

## 🚀 セットアップ手順

### Step 1: Supabase認証を有効化

1. **Supabaseダッシュボードにアクセス**
   ```
   https://supabase.com/dashboard/project/htytewqvkgwyuvcsvjwm/auth/users
   ```

2. **メール認証を有効化**
   - Authentication → Providers → Email
   - Enable Email Provider: ON
   - Confirm email: OFF（開発時）

3. **オプション: ソーシャルログイン**
   - Google OAuth（推奨）
   - GitHub OAuth
   - Twitter OAuth

### Step 2: ユーザー関連テーブルを作成

1. **SQL Editorを開く**
   ```
   https://supabase.com/dashboard/project/htytewqvkgwyuvcsvjwm/sql
   ```

2. **SQLを実行**
   ```sql
   -- /supabase/04-user-system.sql の内容をコピー&ペースト
   -- Runをクリック
   ```

3. **作成されるテーブル**
   - `profiles` - ユーザープロフィール
   - `follows` - フォロー関係
   - `gym_reviews` - ジムレビュー
   - `gym_likes` - お気に入り/行きたい
   - `personal_records` - パーソナルレコード

### Step 3: テストユーザー作成

#### 方法1: Supabaseダッシュボードから
1. Authentication → Users
2. 「Invite user」または「Create new user」
3. Email/Passwordを入力

#### 方法2: JavaScript/TypeScriptから
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// サインアップ
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123',
  options: {
    data: {
      username: 'testuser',
      full_name: 'テストユーザー'
    }
  }
})
```

### Step 4: 動作確認

#### SQLで確認
```sql
-- プロフィール確認
SELECT * FROM profiles;

-- ユーザー統計確認
SELECT * FROM user_stats;

-- レビュー確認
SELECT 
    gr.*, 
    p.display_name,
    g.name as gym_name
FROM gym_reviews gr
JOIN profiles p ON gr.user_id = p.id
JOIN gyms g ON gr.gym_id = g.id;
```

## 📝 実装例

### 認証機能の実装

```typescript
// src/lib/supabase/auth.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ログイン
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

// ログアウト
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// 現在のユーザー取得
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return { user, profile }
  }
  
  return null
}
```

### プロフィール更新

```typescript
// プロフィール更新
export async function updateProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}
```

### レビュー投稿

```typescript
// レビュー投稿
export async function createReview(
  gymId: string,
  rating: number,
  content: string
) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'ログインが必要です' }
  }
  
  const { data, error } = await supabase
    .from('gym_reviews')
    .insert({
      gym_id: gymId,
      user_id: user.id,
      rating,
      content
    })
    .select()
    .single()
  
  return { data, error }
}
```

### フォロー機能

```typescript
// フォロー
export async function followUser(targetUserId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'ログインが必要です' }
  }
  
  const { data, error } = await supabase
    .from('follows')
    .insert({
      follower_id: user.id,
      following_id: targetUserId
    })
  
  return { data, error }
}

// アンフォロー
export async function unfollowUser(targetUserId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'ログインが必要です' }
  }
  
  const { data, error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
  
  return { data, error }
}
```

## 🔒 セキュリティ設定

### RLS（Row Level Security）ポリシー

作成済みのポリシー：
- ✅ プロフィール: 公開/非公開設定
- ✅ レビュー: 誰でも閲覧、本人のみ編集
- ✅ フォロー: 誰でも閲覧、本人のみ操作
- ✅ いいね: 誰でも閲覧、本人のみ操作
- ✅ PR記録: 本人のみ閲覧・編集

### 追加セキュリティ（本番環境）

```sql
-- メール確認を必須にする
UPDATE auth.config 
SET confirm_email = true;

-- レート制限を設定
-- Supabase Dashboard → Settings → Auth → Rate Limits
```

## ✅ チェックリスト

- [ ] Supabase認証を有効化
- [ ] メールプロバイダーを設定
- [ ] 04-user-system.sql を実行
- [ ] テストユーザーを作成
- [ ] profilesテーブルにデータ確認
- [ ] 認証機能をアプリに実装
- [ ] RLSポリシーの動作確認

## 🔍 トラブルシューティング

### エラー: "relation auth.users does not exist"
→ Supabase認証が有効化されていない
→ 解決: Authentication → Settings で有効化

### エラー: "permission denied for table profiles"
→ RLSポリシーが正しく設定されていない
→ 解決: ログイン状態を確認、ポリシーを再確認

### プロフィールが自動作成されない
→ トリガーが正しく設定されていない
→ 解決: handle_new_user関数とトリガーを再作成

## 📊 統計情報の活用

```sql
-- ユーザーランキング（フォロワー数）
SELECT * FROM user_stats
ORDER BY followers_count DESC
LIMIT 10;

-- アクティブユーザー（レビュー投稿数）
SELECT * FROM user_stats
WHERE review_count > 0
ORDER BY review_count DESC;

-- ジムの人気度（いいね数）
SELECT 
    g.name,
    COUNT(gl.id) as like_count
FROM gyms g
LEFT JOIN gym_likes gl ON g.id = gl.gym_id
GROUP BY g.id, g.name
ORDER BY like_count DESC;
```

---
*最終更新: 2025-01-06*