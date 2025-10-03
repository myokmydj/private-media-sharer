// app/[locale]/profile/[userId]/MemoList.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Memo } from '@/types';

export default function MemoList({ userId }: { userId: number }) {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return <div className="py-10 text-center text-sm text-gray-500">Loading memos...</div>;
  }

  if (memos.length === 0) {
    return (
      <div className="text-center bg-gray-50 p-8 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">This user has no public memos yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {memos.map((memo) => (
        <Link key={memo.id} href={`/memo/${memo.id}`} className="block bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors">
          <p className="text-gray-700 line-clamp-3 whitespace-pre-wrap break-words">
            {memo.content.replace(/\|\|.*?\|\|/g, '[스포일러]')}
          </p>
          <p className="text-xs text-gray-400 mt-2 text-right">{new Date(memo.created_at).toLocaleDateString()}</p>
        </Link>
      ))}
    </div>
  );
}