// app/[locale]/memo/[id]/page.tsx

import { notFound } from 'next/navigation';
import { db } from '@vercel/postgres';
import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import MemoContent from './MemoContent';
import type { Memo } from '@/types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

async function getMemoData(id: string): Promise<Memo | null> {
  noStore();
  try {
    const { rows } = await db.sql<Memo>`
      SELECT 
        m.*, 
        u.name as author_name,
        u.image as author_image,
        u.header_image as author_header_image 
      FROM memos m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ${id}
      LIMIT 1;
    `;
    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    console.error("Database query failed:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const memo = await getMemoData(params.id);
  if (!memo) {
    return { title: '메모를 찾을 수 없습니다' };
  }

  const cleanDescription = memo.content
    .replace(/\|\|.*?\|\|/g, `[${memo.spoiler_icon}]`)
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100);
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}`;
  const ogImageUrl = new URL(`${baseUrl}/api/og/memo`);
  
  const getAbsoluteUrl = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return new URL(url, baseUrl).toString();
  };

  // ▼▼▼ [핵심 수정] content 파라미터의 길이를 200자로 제한합니다. ▼▼▼
  const ogContent = memo.content.length > 200 ? memo.content.substring(0, 200) + '...' : memo.content;

  ogImageUrl.searchParams.set('userName', memo.author_name);
  ogImageUrl.searchParams.set('userImage', getAbsoluteUrl(memo.author_image));
  ogImageUrl.searchParams.set('userHeaderImage', getAbsoluteUrl(memo.author_header_image));
  ogImageUrl.searchParams.set('content', ogContent); // 잘린 내용을 전달
  ogImageUrl.searchParams.set('spoilerIcon', memo.spoiler_icon);

  return {
    title: `${memo.author_name}님의 메모`,
    description: cleanDescription,
    openGraph: {
      title: `${memo.author_name}님의 메모`,
      description: cleanDescription,
      images: [ogImageUrl.toString()],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${memo.author_name}님의 메모`,
      description: cleanDescription,
      images: [ogImageUrl.toString()],
    },
  };
}

// ... 파일의 나머지 부분은 그대로 둡니다 ...
async function checkMemoPermission(memo: Memo, viewerId: number | null): Promise<boolean> {
  const authorId = memo.user_id;
  if (memo.visibility === 'public' || !memo.visibility) {
    return true;
  }
  if (!viewerId) return false;
  if (viewerId === authorId) return true;
  if (memo.visibility === 'followers_only') {
    const result = await db.sql`SELECT 1 FROM follows WHERE follower_id = ${viewerId} AND following_id = ${authorId} LIMIT 1;`;
    return (result?.rowCount ?? 0) > 0;
  }
  return false;
}

export default async function ViewMemoPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ? parseInt(session.user.id, 10) : null;
  const memo = await getMemoData(params.id);
  
  if (!memo) {
    notFound();
  }

  const hasPermission = await checkMemoPermission(memo, viewerId);
  if (!hasPermission) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md p-8 text-center space-y-4 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800">접근 권한 없음</h2>
          <p className="text-gray-600">이 메모를 볼 수 있는 권한이 없습니다.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4 flex items-center justify-center">
      <MemoContent memo={memo} />
    </main>
  );
}