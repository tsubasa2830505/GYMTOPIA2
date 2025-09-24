/**
 * 遅延投稿機能のスタブ実装
 */

export interface DelayedPost {
  id?: string
  user_id: string
  gym_id: string
  content: string
  scheduled_at: string
  status: 'pending' | 'posted' | 'failed'
}

/**
 * 遅延投稿をスケジュール（現在は無効化）
 */
export async function scheduleDelayedPost(postData: DelayedPost): Promise<{ success: boolean; error?: string }> {
  // 現在は遅延投稿機能を無効化
  console.warn('Delayed post functionality is currently disabled')
  return { success: false, error: 'Delayed post functionality is disabled' }
}

/**
 * 保留中の遅延投稿を取得
 */
export async function getPendingDelayedPosts(): Promise<DelayedPost[]> {
  return []
}

/**
 * 遅延投稿を実行
 */
export async function executeDelayedPost(postId: string): Promise<boolean> {
  return false
}