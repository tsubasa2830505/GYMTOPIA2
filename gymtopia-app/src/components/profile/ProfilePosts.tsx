'use client';

import { GymPost } from '@/lib/types/profile';
import PostCard from '../PostCard';

interface ProfilePostsProps {
  posts: GymPost[];
  isLoading: boolean;
}

export default function ProfilePosts({ posts, isLoading }: ProfilePostsProps) {
  if (isLoading) {
    return <div className="text-center py-8">­¼-...</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[color:var(--text-muted)]">
          ¸à;Õ’2WfDM~W‡F
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}