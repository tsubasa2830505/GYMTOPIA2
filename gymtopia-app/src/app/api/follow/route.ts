import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimiters } from '@/lib/middleware/rateLimit';
import { logger } from '@/lib/utils/logger';
import { validateUUIDs } from '@/lib/utils/validation';

// 環境変数の安全な取得
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    logger.error('Missing Supabase environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey
    });
    return null;
  }

  // Service role clientを作成（RLSを迂回）
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function POST(request: NextRequest) {
  // レート制限チェック
  const rateLimitResult = await rateLimiters.api(request);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const { followerId, followingId, action } = await request.json();

    logger.log('Follow API POST request:', { followerId, followingId, action });

    if (!followerId || !followingId) {
      logger.error('Missing required parameters:', { followerId, followingId });
      return NextResponse.json(
        { error: 'フォロワーIDとフォローイングIDが必要です' },
        { status: 400 }
      );
    }

    // UUID検証
    const uuidError = validateUUIDs({ followerId, followingId });
    if (uuidError) {
      return NextResponse.json(
        { error: uuidError },
        { status: 400 }
      );
    }

    if (followerId === followingId) {
      logger.error('Cannot follow self:', { followerId, followingId });
      return NextResponse.json(
        { error: '自分自身をフォローすることはできません' },
        { status: 400 }
      );
    }

    // Supabase admin client取得
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      logger.error('Supabase admin client not initialized - missing environment variables');
      return NextResponse.json(
        { error: 'データベース接続に失敗しました' },
        { status: 500 }
      );
    }

    if (action === 'follow') {
      // フォロー処理を最適化: upsert を使用して重複チェックと挿入を一回で行う
      const { data, error } = await supabaseAdmin
        .from('follows')
        .upsert({
          follower_id: followerId,
          following_id: followingId
        }, {
          onConflict: 'follower_id,following_id',
          ignoreDuplicates: true
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating follow:', error);
        return NextResponse.json(
          { error: 'フォローに失敗しました' },
          { status: 500 }
        );
      }

      // 通知作成を非同期で実行（応答時間を改善）
      setImmediate(async () => {
        try {
          await supabaseAdmin
            .from('notifications')
            .insert({
              user_id: followingId,
              type: 'follow',
              title: '新しいフォロワー',
              message: 'あなたをフォローしました',
              related_user_id: followerId,
              is_read: false
            });
        } catch (notificationError) {
          logger.warn('Failed to create notification:', notificationError);
        }
      });

      return NextResponse.json(
        { message: 'フォローしました', data },
        { status: 201 }
      );

    } else if (action === 'unfollow') {
      // アンフォロー処理
      const { error } = await supabaseAdmin
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) {
        logger.error('Error unfollowing:', error);
        return NextResponse.json(
          { error: 'アンフォローに失敗しました' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: 'アンフォローしました' },
        { status: 200 }
      );

    } else {
      return NextResponse.json(
        { error: '無効なアクションです' },
        { status: 400 }
      );
    }

  } catch (error) {
    logger.error('Follow API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // レート制限チェック
  const rateLimitResult = await rateLimiters.api(request);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const followerId = searchParams.get('followerId');
    const followingId = searchParams.get('followingId');

    if (!followerId || !followingId) {
      return NextResponse.json(
        { error: 'フォロワーIDとフォローイングIDが必要です' },
        { status: 400 }
      );
    }

    // UUID検証
    const uuidError = validateUUIDs({ followerId, followingId });
    if (uuidError) {
      return NextResponse.json(
        { error: uuidError },
        { status: 400 }
      );
    }

    // Supabase admin client取得
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      logger.error('Supabase admin client not initialized - missing environment variables');
      return NextResponse.json(
        { error: 'データベース接続に失敗しました' },
        { status: 500 }
      );
    }

    // フォロー状態をチェック
    const { data, error } = await supabaseAdmin
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Error checking follow status:', error);
      return NextResponse.json(
        { error: 'フォロー状態の確認に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { isFollowing: !!data },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Follow check API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}