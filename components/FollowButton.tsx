// components/FollowButton.tsx (덮어쓰기)
'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface FollowButtonProps {
  targetUserId: number;
  isInitiallyFollowing: boolean;
}

export default function FollowButton({ targetUserId, isInitiallyFollowing }: FollowButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [isPending, startTransition] = useTransition();

  const isLoading = status === 'loading' || isPending;

  if (status === 'unauthenticated') {
    return (
      <button onClick={() => router.push('/login')} className="px-4 py-1.5 text-xs font-semibold rounded-full bg-gray-800 text-white hover:bg-gray-700">
        Follow
      </button>
    );
  }

  if (!session || session.user.id === String(targetUserId)) {
    return null;
  }

  const handleClick = async () => {
    startTransition(async () => {
      const action = isFollowing ? 'unfollow' : 'follow';
      try {
        const res = await fetch(`/api/users/${targetUserId}/follow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });
        if (res.ok) {
          setIsFollowing(!isFollowing);
          router.refresh();
        } else {
          console.error('Follow action failed');
        }
      } catch (error) {
        console.error(error);
      }
    });
  };

  const baseStyle = "w-24 px-4 py-1.5 text-xs font-semibold rounded-full transition-colors disabled:opacity-50";
  const followingStyle = "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100";
  const followStyle = "bg-gray-800 text-white hover:bg-gray-700 border border-transparent";

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${baseStyle} ${isFollowing ? followingStyle : followStyle}`}
    >
      {isLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}