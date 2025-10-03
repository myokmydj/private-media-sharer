// app/api/profile/update-image/route.ts (새 파일)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { db } from '@vercel/postgres';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않았습니다.' }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);
  const { imageUrl }: { imageUrl: string } = await request.json();

  if (!imageUrl) {
    return NextResponse.json({ error: '이미지 URL이 필요합니다.' }, { status: 400 });
  }

  try {
    await db.sql`UPDATE users SET image = ${imageUrl} WHERE id = ${userId};`;
    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Failed to update profile image:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}