// app/[locale]/my-posts/page.tsx (덮어쓰기)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, PlusCircle, Trash2, Lock, Users, Eye } from 'lucide-react';
import type { Post } from '@/types';
import { useParams } from 'next/navigation'; // useParams 추가

export default function MyPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams(); // params 훅 사용
  const locale = params.locale; // locale 가져오기

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/my-posts');
        if (!res.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleDelete = async (postId: string) => {
    if (!confirm('정말 이 포스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '삭제에 실패했습니다.');
      }
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (error: any) {
      alert(`오류: ${error.message}`);
    }
  };

  const VisibilityIcon = ({ visibility }: { visibility?: string }) => {
    switch (visibility) {
      case 'public': return <Eye size={14} className="text-gray-500" title="전체 공개" />;
      case 'password': return <Lock size={14} className="text-gray-500" title="비밀번호" />;
      case 'followers_only': return <Users size={14} className="text-gray-500" title="팔로워 공개" />;
      default: return <Eye size={14} className="text-gray-500" title="전체 공개" />;
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">포스트를 불러오는 중...</div>;
  }

  return (
    <main className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">내 포스트 보관함</h1>
        {/* ▼▼▼ [수정] Link에 locale 추가 ▼▼▼ */}
        <Link href={`/${locale}/upload`} className="btn-primary inline-flex items-center gap-2">
          <PlusCircle size={16} />
          새 포스트
        </Link>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center border-2 border-dashed border-gray-400 p-12">
          <p className="text-gray-600">아직 작성한 포스트가 없습니다.</p>
          {/* ▼▼▼ [수정] Link에 locale 추가 ▼▼▼ */}
          <Link href={`/${locale}/upload`} className="mt-4 btn-secondary">
            첫 포스트 작성하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="group bg-white border border-black flex flex-col">
              {/* ▼▼▼ [수정] Link에 locale 추가 ▼▼▼ */}
              <Link href={`/${locale}/view/${post.id}`} className="block">
                <div className="relative aspect-square border-b border-black">
                  <Image
                    src={post.thumbnail_url}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={`object-cover transition-transform group-hover:scale-105 ${post.is_nsfw || post.is_thumbnail_blurred ? 'blur-md' : ''}`}
                  />
                  {post.is_nsfw && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm tracking-widest font-mono">NSFW</div>}
                </div>
              </Link>
              <div className="p-3 flex-grow flex flex-col justify-between">
                <div>
                  <h2 className="font-semibold text-gray-800 truncate group-hover:underline">{post.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <VisibilityIcon visibility={post.visibility} />
                    <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end items-center gap-1">
                  {/* ▼▼▼ [수정] Link에 locale 추가 ▼▼▼ */}
                  <Link href={`/${locale}/edit/${post.id}`} className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 transition-colors">
                    <Edit size={16} />
                  </Link>
                  <button onClick={() => handleDelete(post.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}