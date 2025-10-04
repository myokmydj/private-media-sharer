// app/[locale]/profile/[userId]/MemoList.tsx (덮어쓰기)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Memo } from '@/types';
import { useSession } from 'next-auth/react';
import { Trash2, ArrowRight } from 'lucide-react';
import { useParams } from 'next/navigation'; // useParams 추가

export default function MemoList({ userId }: { userId: number }) {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const params = useParams(); // params 훅 사용
  const locale = params.locale; // locale 가져오기
  const viewerId = session?.user?.id ? parseInt(session.user.id, 10) : null;
  const isOwnProfile = viewerId === userId;

  useEffect(() => {
    const fetchMemos = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/profile/${userId}/memos`);
        if (!res.ok) throw new Error('Failed to fetch memos');
        const data = await res.json();
        setMemos(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMemos();
  }, [userId]);

  const handleDelete = async (memoId: string) => {
    if (!confirm('정말 이 메모를 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/memos/${memoId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제 실패');
      setMemos(memos.filter(memo => memo.id !== memoId));
    } catch (error) {
      console.error(error);
      alert('메모 삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="content-card p-4 h-36 animate-pulse bg-gray-200/50"></div>
        ))}
      </div>
    );
  }

  if (memos.length === 0) {
    return (
      <div className="text-center border-2 border-dashed border-gray-300 p-8 rounded-lg">
        <p className="text-sm text-gray-600">This user has no public memos yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {memos.map((memo) => (
        <div key={memo.id} className="group content-card flex flex-col">
          <div className="p-4 flex-grow">
            <p className="text-gray-700 text-sm line-clamp-4 whitespace-pre-wrap break-words">
              {memo.content.replace(/\|\|.*?\|\|/g, '[스포일러]')}
            </p>
          </div>
          <div className="border-t border-gray-200/80 p-3 flex justify-between items-center">
            <p className="font-mono text-xs text-gray-500">{new Date(memo.created_at).toLocaleDateString()}</p>
            <div className="flex items-center">
              {isOwnProfile && (
                <button
                  onClick={() => handleDelete(memo.id)}
                  className="p-2 text-gray-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="메모 삭제"
                >
                  <Trash2 size={14} />
                </button>
              )}
              {/* ▼▼▼ [수정] Link에 locale 추가 ▼▼▼ */}
              <Link 
                href={`/${locale}/memo/${memo.id}`} 
                className="p-2 text-gray-500 hover:text-blue-600"
              >
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}