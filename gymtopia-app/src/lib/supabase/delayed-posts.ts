/**
 * 遅延投稿機能
 * チェックイン後の自動投稿を指定時間後に実行
 */

import { getSupabaseClient } from './client';
import { logger } from '../utils/logger';

export interface DelayedPostData {
  id?: string;
  user_id: string;
  checkin_id: string;
  gym_data: {
    id: string;
    name: string;
    area?: string;
  };
  badges: Array<{
    badge_name: string;
    badge_icon: string;
    rarity: string;
  }>;
  options: {
    shareLevel: 'badge_only' | 'gym_name' | 'gym_with_area' | 'none';
    audience: 'public' | 'friends' | 'private';
  };
  scheduled_at: string; // ISO timestamp
  status: 'pending' | 'posted' | 'failed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

/**
 * 遅延投稿をスケジュール
 */
export async function scheduleDelayedPost(
  userId: string,
  checkinId: string,
  gym: { id: string; name: string; area?: string },
  badges: Array<{ badge_name: string; badge_icon: string; rarity: string }>,
  options: {
    shareLevel: 'badge_only' | 'gym_name' | 'gym_with_area' | 'none';
    delayMinutes: number;
    audience: 'public' | 'friends' | 'private';
  }
): Promise<string | null> {
  try {
    if (options.shareLevel === 'none' || options.delayMinutes <= 0) {
      return null;
    }

    const scheduledAt = new Date(Date.now() + options.delayMinutes * 60 * 1000);

    const delayedPostData: Omit<DelayedPostData, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      checkin_id: checkinId,
      gym_data: gym,
      badges,
      options: {
        shareLevel: options.shareLevel,
        audience: options.audience,
      },
      scheduled_at: scheduledAt.toISOString(),
      status: 'pending'
    };

    const { data, error } = await getSupabaseClient()
      .from('delayed_posts')
      .insert(delayedPostData)
      .select('id')
      .single();

    if (error) {
      logger.error('Error scheduling delayed post:', error);
      return null;
    }

    logger.log(`📅 遅延投稿スケジュール済み: ${options.delayMinutes}分後 (${scheduledAt.toLocaleString('ja-JP')})`);
    return data.id;
  } catch (error) {
    logger.error('Error scheduling delayed post:', error);
    return null;
  }
}

/**
 * 実行待ちの遅延投稿を取得
 */
export async function getPendingDelayedPosts(): Promise<DelayedPostData[]> {
  try {
    const now = new Date().toISOString();

    const { data, error } = await getSupabaseClient()
      .from('delayed_posts')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(50); // 一度に最大50件処理

    if (error) {
      logger.error('Error fetching pending delayed posts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error('Error fetching pending delayed posts:', error);
    return [];
  }
}

/**
 * 遅延投稿を実行
 */
export async function executeDelayedPost(delayedPost: DelayedPostData): Promise<boolean> {
  try {
    // コンテンツ生成
    let content = '';

    // バッジ情報
    if (delayedPost.badges.length > 0) {
      const badgeTexts = delayedPost.badges.map(badge => `${badge.badge_icon} ${badge.badge_name}`);
      content += `🎯 新しいバッジ獲得！\n${badgeTexts.join('\n')}\n\n`;
    }

    // ジム情報の表示レベル
    const { shareLevel } = delayedPost.options;
    const gym = delayedPost.gym_data;

    if (shareLevel === 'gym_name') {
      content += `🏋️‍♂️ ${gym.name}でワークアウト完了！`;
    } else if (shareLevel === 'gym_with_area' && gym.area) {
      content += `🏋️‍♂️ ${gym.name} (${gym.area})でワークアウト完了！`;
    } else if (shareLevel === 'badge_only') {
      content += `🏋️‍♂️ ワークアウト完了！`;
    }

    content += '\n✅ GPS認証済み';

    // 投稿作成
    const { data: post, error: postError } = await getSupabaseClient()
      .from('gym_posts')
      .insert({
        user_id: delayedPost.user_id,
        gym_id: delayedPost.gym_data.id,
        content,
        visibility: delayedPost.options.audience,
        checkin_id: delayedPost.checkin_id,
        is_verified: true,
        verification_method: 'gps',
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (postError) {
      logger.error('Error creating delayed post:', postError);

      // 失敗としてマーク
      await getSupabaseClient()
        .from('delayed_posts')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', delayedPost.id!);

      return false;
    }

    // 成功としてマーク
    await getSupabaseClient()
      .from('delayed_posts')
      .update({
        status: 'posted',
        updated_at: new Date().toISOString()
      })
      .eq('id', delayedPost.id!);

    logger.log(`✅ 遅延投稿実行完了: Post ID ${post.id}`);
    return true;
  } catch (error) {
    logger.error('Error executing delayed post:', error);

    // 失敗としてマーク
    if (delayedPost.id) {
      await getSupabaseClient()
        .from('delayed_posts')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', delayedPost.id);
    }

    return false;
  }
}

/**
 * 遅延投稿をキャンセル
 */
export async function cancelDelayedPost(delayedPostId: string): Promise<boolean> {
  try {
    const { error } = await getSupabaseClient()
      .from('delayed_posts')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', delayedPostId)
      .eq('status', 'pending'); // pending状態のもののみキャンセル可能

    if (error) {
      logger.error('Error cancelling delayed post:', error);
      return false;
    }

    logger.log(`🚫 遅延投稿キャンセル: ${delayedPostId}`);
    return true;
  } catch (error) {
    logger.error('Error cancelling delayed post:', error);
    return false;
  }
}

/**
 * ユーザーの遅延投稿一覧を取得
 */
export async function getUserDelayedPosts(
  userId: string,
  status?: 'pending' | 'posted' | 'failed' | 'cancelled'
): Promise<DelayedPostData[]> {
  try {
    let query = getSupabaseClient()
      .from('delayed_posts')
      .select('*')
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      logger.error('Error fetching user delayed posts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error('Error fetching user delayed posts:', error);
    return [];
  }
}

/**
 * 遅延投稿処理バッチジョブ
 * 定期的に実行してpending状態の投稿を処理
 */
export async function processDelayedPostsBatch(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  try {
    const pendingPosts = await getPendingDelayedPosts();

    if (pendingPosts.length === 0) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    logger.log(`🔄 遅延投稿バッチ処理開始: ${pendingPosts.length}件`);

    let succeeded = 0;
    let failed = 0;

    for (const post of pendingPosts) {
      const success = await executeDelayedPost(post);
      if (success) {
        succeeded++;
      } else {
        failed++;
      }

      // レート制限回避のため少し待機
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger.log(`✅ 遅延投稿バッチ処理完了: 成功 ${succeeded}件, 失敗 ${failed}件`);

    return {
      processed: pendingPosts.length,
      succeeded,
      failed
    };
  } catch (error) {
    logger.error('Error in delayed posts batch process:', error);
    return { processed: 0, succeeded: 0, failed: 0 };
  }
}