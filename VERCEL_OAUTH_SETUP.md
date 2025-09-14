# Vercel で Google ログインを動かすための設定手順

## 1) Supabase 側設定

- Google Provider を有効化（Auth → Providers → Google）
  - Client ID / Client Secret を設定
- Redirect URL 設定（Auth → URL Configuration）
  - Site URL: 本番URL（例: `https://your-domain.vercel.app`）
  - Additional Redirect URLs:
    - ローカル: `http://localhost:3000/auth/callback`
    - 本番: `https://your-domain.vercel.app/auth/callback`
    - Previewも検証する場合は、そのURLを個別に追加
      - 例: `https://your-branch-your-project.vercel.app/auth/callback`
      - 備考: Supabaseの追加リダイレクトURLはワイルドカードを前提にしていません。Previewを安定して使う場合は、アプリ側で常に本番ドメインへリダイレクトする運用も有効です（下記参照）。

## 2) Vercel 側設定

- Project → Settings → Environment Variables（Production/Preview）
  - `NEXT_PUBLIC_SUPABASE_URL = https://<project-ref>.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY = <anon key>`
  - （任意）`NEXT_PUBLIC_SITE_URL = https://your-domain.vercel.app`
    - これを設定すると、OAuth後のリダイレクト先が常にこのURLになります
    - Previewでも本番ドメインへ戻す運用をしたい時に便利
- （任意）Protection（パスワード保護）をオンにしている場合
  - `/auth/callback` が 401 になりログインが完了できません
  - 本番公開前に検証する場合は、Password Protection を一時的に Off にするか、Protection Bypass を用意して該当ルートを通す運用にしてください

## 3) アプリ側（このリポジトリでの実装）

- `auth/login` はクリック時に Supabase クライアントを生成し、リダイレクト先を次の優先で決定します：
  1. `NEXT_PUBLIC_SITE_URL` があればそれを使用
  2. それ以外は `window.location.origin`
- コールバックルート: `/auth/callback`（1秒待ってトップへ戻ります。AuthContextがセッションを取得）

## 4) 典型的な失敗パターンと対処

- `redirect_uri_mismatch`
  - Supabaseの Additional Redirect URLs に該当URLが未登録
- `supabaseUrl is required.`（ビルド時）
  - Vercelの環境変数に `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` が未設定
  - もしくはビルド時に参照しないよう、クライアント生成を遅延化（本リポジトリでは対応済み）
- 401/Authentication Required（Vercel保護）
  - Password Protection/Trusted IPs をオフにするか、Bypassで `/auth/callback` を通す

---

メモ: Previewでも本番ドメインへ戻して良い運用にする場合は、Supabase 側は本番の `.../auth/callback` だけ登録しておけば運用がシンプルになります。

