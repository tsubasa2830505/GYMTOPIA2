import { likePost, unlikePost, updatePost, deletePost as deletePostAPI, type Post } from '@/lib/supabase/posts'

interface UseFeedActionsParams {
  posts: Post[]
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>
  userId: string | undefined
}

export function useFeedActions({ posts, setPosts, userId }: UseFeedActionsParams) {
  const handleLike = async (post: Post) => {
    if (!userId) {
      console.error('User not authenticated for like action')
      return
    }

    console.log('いいね処理開始:', { postId: post.id, isLiked: post.is_liked, userId })

    try {
      if (post.is_liked) {
        await unlikePost(post.id)
        setPosts(posts.map(p =>
          p.id === post.id
            ? { ...p, is_liked: false, likes_count: p.likes_count - 1 }
            : p
        ))
        console.log('いいね削除完了')
      } else {
        await likePost(post.id)
        setPosts(posts.map(p =>
          p.id === post.id
            ? { ...p, is_liked: true, likes_count: p.likes_count + 1 }
            : p
        ))
        console.log('いいね追加完了')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleSaveEdit = async (
    editingPost: Post,
    updatedData: Partial<Post> & { workout_started_at?: string; workout_ended_at?: string }
  ) => {
    console.log('Saving edit with data:', updatedData)
    console.log('Editing post ID:', editingPost.id)
    console.log('Images being saved:', updatedData.images)

    try {
      if (editingPost.id.startsWith('sample-')) {
        const updatedPosts = posts.map(p => {
          if (p.id === editingPost.id) {
            const updated: any = {
              ...p,
              content: updatedData.content !== undefined ? updatedData.content : p.content,
              images: updatedData.images !== undefined ? updatedData.images : p.images,
              training_details: updatedData.training_details !== undefined
                ? updatedData.training_details
                : p.training_details,
              workout_started_at: updatedData.workout_started_at !== undefined
                ? updatedData.workout_started_at
                : (p as any).workout_started_at,
              workout_ended_at: updatedData.workout_ended_at !== undefined
                ? updatedData.workout_ended_at
                : (p as any).workout_ended_at
            }

            if (updated.workout_started_at && updated.workout_ended_at) {
              const [startHour, startMin] = updated.workout_started_at.split(':').map(Number)
              const [endHour, endMin] = updated.workout_ended_at.split(':').map(Number)
              const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin)
              updated.workout_duration_calculated = duration > 0 ? duration : 0
            }

            console.log('Updated sample post:', updated)
            return updated
          }
          return p
        })

        setPosts([...updatedPosts])
        return
      }

      const updatePayload = {
        content: updatedData.content,
        images: updatedData.images,
        training_details: updatedData.training_details,
        workout_started_at: updatedData.workout_started_at,
        workout_ended_at: updatedData.workout_ended_at
      }

      console.log('Updating post in database:', editingPost.id, updatePayload)
      const updatedPost = await updatePost(editingPost.id, updatePayload)

      const updatedPosts = posts.map(p => {
        if (p.id === editingPost.id) {
          return {
            ...p,
            ...updatedPost,
            user: p.user,
            gym: p.gym
          }
        }
        return p
      })

      setPosts([...updatedPosts])
      console.log('Post updated successfully')
    } catch (error) {
      console.error('Error updating post:', error)
      alert('投稿の更新に失敗しました')
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('この投稿を削除してもよろしいですか？')) {
      return
    }

    try {
      await deletePostAPI(postId)
      setPosts(posts.filter(p => p.id !== postId))
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('投稿の削除に失敗しました')
    }
  }

  return {
    handleLike,
    handleSaveEdit,
    handleDeletePost
  }
}