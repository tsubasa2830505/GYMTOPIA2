import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role clientを作成（RLSを迂回）
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const { followerId, followingId, action } = await request.json();

    console.log('Follow API POST request:', { followerId, followingId, action });

    if (!followerId || !followingId) {
      console.error('Missing required parameters:', { followerId, followingId });
      return NextResponse.json(
        { error: 'フォロワーIDとフォローイングIDが必要です' },
        { status: 400 }
      );
    }

    if (followerId === followingId) {
      console.error('Cannot follow self:', { followerId, followingId });
      return NextResponse.json(
        { error: '自分自身をフォローすることはできません' },
        { status: 400 }
      );
    }

    // Supabase admin client check
    if (!supabaseAdmin) {
      console.error('Supabase admin client not initialized');
      return NextResponse.json(
        { error: 'データベース接続に失敗しました' },
        { status: 500 }
      );
    }

    if (action === 'follow') {
      // フォロー処理
      // 既にフォローしているかチェック
      const { data: existingFollow } = await supabaseAdmin
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      if (existingFollow) {
        return NextResponse.json(
          { message: '既にフォローしています', data: existingFollow },
          { status: 200 }
        );
      }

      // フォロー追加
      const { data, error } = await supabaseAdmin
        .from('follows')
        .insert({
          follower_id: followerId,
          following_id: followingId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating follow:', error);
        return NextResponse.json(
          { error: 'フォローに失敗しました' },
          { status: 500 }
        );
      }

      // 通知を作成（オプション）
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
        console.warn('Failed to create notification:', notificationError);
        // 通知作成に失敗してもフォローは成功とする
      }

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
        console.error('Error unfollowing:', error);
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
    console.error('Follow API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    // フォロー状態をチェック
    const { data, error } = await supabaseAdmin
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking follow status:', error);
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
    console.error('Follow check API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}