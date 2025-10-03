// app/[locale]/memo/[id]/MemoContent.tsx
'use client';

import { useState, useEffect, MouseEvent } from 'react';
import type { Memo } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

function SpoilerContent({ text }: { text: string }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <span
      className={revealed ? 'spoiler-revealed' : 'spoiler'}
      onClick={() => setRevealed(true)}
    >
      {text}
    </span>
  );
}

export default function MemoContent({ memo }: { memo: Memo }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const parsedContent = memo.content.split(/(\|\|.*?\|\|)/g).filter(Boolean);

  return (
    <div className="w-full max-w-2xl bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center mb-6 not-prose">
        <Link href={`/profile/${memo.user_id}`} className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
            <Image
              src={memo.author_image || '/default-avatar.png'}
              alt={memo.author_name}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div>
            <p className="font-bold text-gray-800 group-hover:underline">{memo.author_name}</p>
            <p className="text-xs text-gray-500">{new Date(memo.created_at).toLocaleString()}</p>
          </div>
        </Link>
      </div>
      
      <div className="prose prose-lg max-w-none whitespace-pre-wrap break-words">
        {isClient ? (
          parsedContent.map((part, index) => {
            if (part.startsWith('||') && part.endsWith('||')) {
              return <SpoilerContent key={index} text={part.slice(2, -2)} />;
            }
            return part;
          })
        ) : (
          <p>Loading content...</p>
        )}
      </div>
    </div>
  );
}