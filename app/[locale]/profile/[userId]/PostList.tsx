// app/[locale]/profile/[userId]/PostList.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/types';
import { useParams } from 'next/navigation'; // useParams 추가

export default function PostList({ userId }: { userId: number }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams(); // params 훅 사용
  const locale = params.locale; // locale 가져오기

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/profile/${userId}/posts`);
        if (!res.ok) throw new Error('Failed to fetch posts');
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [userId]);

  if (isLoading) {
    return <div className="py-10 text-center text-sm text-gray-500">Loading posts...</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center bg-gray-50 p-8 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">This user has no public posts yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        // ▼▼▼ [수정] Link에 locale 추가 ▼▼▼
        <Link key={post.id} href={`/${locale}/view/${post.id}`} className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative aspect-square">
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover transition-transform group-hover:scale-105 ${post.is_nsfw || post.is_thumbnail_blurred ? 'blur-md' : ''}`}
            />
            {post.is_nsfw && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm tracking-widest">NSFW</div>}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-base text-gray-800 truncate">{post.title}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}