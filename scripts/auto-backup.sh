#!/bin/bash

# 自動バックアップスクリプト
# 重要な変更前に自動的にバックアップを作成

set -e

# カラー設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 現在の日時を取得
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
BACKUP_BRANCH="backup_${TIMESTAMP}"

echo -e "${BLUE}🔄 自動バックアップを開始します...${NC}"

# 現在のブランチ名を取得
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}📍 現在のブランチ: ${CURRENT_BRANCH}${NC}"

# 未コミットの変更があるかチェック
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  未コミットの変更が検出されました${NC}"

    # ステージングエリアに追加
    git add -A

    # 一時コミットを作成
    git commit -m "自動バックアップ: ${TIMESTAMP} - 一時保存"

    echo -e "${GREEN}✅ 変更を一時コミットしました${NC}"
fi

# バックアップブランチを作成
git branch "${BACKUP_BRANCH}"
echo -e "${GREEN}✅ バックアップブランチを作成しました: ${BACKUP_BRANCH}${NC}"

# GitHubにプッシュ
if git remote | grep -q origin; then
    echo -e "${BLUE}🚀 GitHubにバックアップをプッシュ中...${NC}"

    # メインブランチをプッシュ
    git push origin "${CURRENT_BRANCH}"

    # バックアップブランチもプッシュ
    git push origin "${BACKUP_BRANCH}"

    echo -e "${GREEN}✅ GitHubへのプッシュが完了しました${NC}"
else
    echo -e "${YELLOW}⚠️  リモートリポジトリが設定されていません${NC}"
fi

# バックアップ情報を記録
BACKUP_LOG="backups/backup_log.txt"
mkdir -p backups
echo "${TIMESTAMP} - Branch: ${BACKUP_BRANCH} - Current: ${CURRENT_BRANCH}" >> "${BACKUP_LOG}"

echo -e "${GREEN}🎉 バックアップが完了しました！${NC}"
echo -e "${BLUE}📋 バックアップブランチ: ${BACKUP_BRANCH}${NC}"
echo -e "${BLUE}📄 ログファイル: ${BACKUP_LOG}${NC}"

# 古いバックアップブランチの自動削除（7日以上前）
echo -e "${BLUE}🧹 古いバックアップブランチをクリーンアップ中...${NC}"

# 7日前の日付を計算
CUTOFF_DATE=$(date -d '7 days ago' '+%Y%m%d' 2>/dev/null || date -v-7d '+%Y%m%d')

# ローカルの古いバックアップブランチを削除
for branch in $(git branch | grep 'backup_' | tr -d ' '); do
    if [[ $branch =~ backup_([0-9]{8})_.* ]]; then
        branch_date="${BASH_REMATCH[1]}"
        if [[ $branch_date < $CUTOFF_DATE ]]; then
            echo -e "${YELLOW}🗑️  古いブランチを削除: ${branch}${NC}"
            git branch -D "${branch}" 2>/dev/null || true

            # リモートからも削除
            if git remote | grep -q origin; then
                git push origin --delete "${branch}" 2>/dev/null || true
            fi
        fi
    fi
done

echo -e "${GREEN}✨ 自動バックアップシステムが正常に動作しました！${NC}"