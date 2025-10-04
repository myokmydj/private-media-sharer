// app/api/my-posts/route.ts (새 파일)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { db } from '@vercel/postgres';
import type { Post } from '@/types';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  try {
    const result = await db.sql<Post>`
      SELECT * FROM posts 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch my posts:', error);
    return NextResponse.json({ error: '게시물을 불러오는 중 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}