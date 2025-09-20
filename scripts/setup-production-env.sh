#!/bin/bash

# 🚀 Production Environment Setup Script
#
# このスクリプトは、本番環境の環境変数を設定するために使用されます。
# 長期運用を考慮した自動化ツールです。

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 必要な環境変数の定義
REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
)

# デフォルト値の定義
DEFAULT_SUPABASE_URL="https://htytewqvkgwyuvcsvjwm.supabase.co"
DEFAULT_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzQyNDYsImV4cCI6MjA3MjcxMDI0Nn0.xltaH28adx1dIhsqaWllLDPEjw8iDrSglDIwj19rXnA"
DEFAULT_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEzNDI0NiwiZXhwIjoyMDcyNzEwMjQ2fQ.VVNIX12yaN7t3seEzRwbMRtmNEbHoEkPXYeBzt60JBs"

# Vercelトークンのチェック
check_vercel_token() {
    if [ -z "$VERCEL_TOKEN" ]; then
        log_error "VERCEL_TOKEN環境変数が設定されていません"
        log_info "以下のコマンドでトークンを設定してください:"
        echo "export VERCEL_TOKEN=your_token_here"
        exit 1
    fi
}

# Vercel CLIのインストールチェック
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        log_warning "Vercel CLIがインストールされていません"
        log_info "Vercel CLIをインストールしています..."
        npm install -g vercel@latest
    fi
}

# プロジェクトのリンク
link_project() {
    log_info "Vercelプロジェクトをリンクしています..."
    if vercel link --yes --token "$VERCEL_TOKEN" 2>/dev/null; then
        log_success "プロジェクトリンク完了"
    else
        log_warning "プロジェクトリンクに失敗。手動でリンクが必要な場合があります"
    fi
}

# 環境変数の設定
set_environment_variable() {
    local var_name=$1
    local var_value=$2
    local environment=${3:-"production"}

    log_info "設定中: $var_name ($environment)"

    if echo "$var_value" | vercel env add "$var_name" "$environment" --token "$VERCEL_TOKEN" 2>/dev/null; then
        log_success "$var_name を設定しました"
    else
        log_warning "$var_name の設定に失敗しました（既に存在する可能性があります）"
    fi
}

# 環境変数の確認
verify_environment_variables() {
    log_info "環境変数を確認しています..."

    if vercel env ls --token "$VERCEL_TOKEN"; then
        log_success "環境変数リストを取得しました"
    else
        log_error "環境変数の確認に失敗しました"
    fi
}

# 本番デプロイのトリガー
trigger_deployment() {
    log_info "本番デプロイメントをトリガーしています..."

    if vercel --prod --yes --token "$VERCEL_TOKEN"; then
        log_success "デプロイメントが開始されました"
    else
        log_error "デプロイメントの開始に失敗しました"
    fi
}

# メイン実行関数
main() {
    echo "🚀 GYMTOPIA 2.0 Production Environment Setup"
    echo "============================================="

    # 前提条件のチェック
    check_vercel_token
    check_vercel_cli

    # プロジェクトリンク
    link_project

    # 環境変数の設定
    log_info "環境変数を設定しています..."

    set_environment_variable "NEXT_PUBLIC_SUPABASE_URL" "$DEFAULT_SUPABASE_URL" "production"
    set_environment_variable "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$DEFAULT_ANON_KEY" "production"
    set_environment_variable "SUPABASE_SERVICE_ROLE_KEY" "$DEFAULT_SERVICE_KEY" "production"

    # Preview環境にも設定
    log_info "Preview環境にも環境変数を設定しています..."
    set_environment_variable "NEXT_PUBLIC_SUPABASE_URL" "$DEFAULT_SUPABASE_URL" "preview"
    set_environment_variable "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$DEFAULT_ANON_KEY" "preview"
    set_environment_variable "SUPABASE_SERVICE_ROLE_KEY" "$DEFAULT_SERVICE_KEY" "preview"

    # 環境変数の確認
    verify_environment_variables

    # デプロイメントのトリガー
    read -p "本番デプロイメントを実行しますか？ (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        trigger_deployment
    else
        log_info "デプロイメントをスキップしました"
    fi

    log_success "環境設定が完了しました！"
    echo ""
    echo "📋 次のステップ:"
    echo "1. Vercelダッシュボードで環境変数を確認"
    echo "2. デプロイメントの完了を確認"
    echo "3. アプリケーションの動作確認"
}

# スクリプト実行
main "$@"