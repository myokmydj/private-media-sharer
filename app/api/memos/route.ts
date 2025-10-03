// app/api/memos/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { db } from '@vercel/postgres';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
  }
  const userId = parseInt(session.user.id, 10);

  try {
    const { content, spoiler_icon, visibility } = await request.json();

    if (!content) {
      return NextResponse.json({ error: '내용은 필수입니다.' }, { status: 400 });
    }

    const id = nanoid(21);

    await db.sql`
      INSERT INTO memos (id, user_id, content, spoiler_icon, visibility)
      VALUES (${id}, ${userId}, ${content}, ${spoiler_icon}, ${visibility});
    `;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}`;
    // ▼▼▼ [수정] 생성되는 URL에 기본 로케일 'ko'를 포함시킵니다. ▼▼▼
    const defaultLocale = 'ko';
    return NextResponse.json({ url: `${baseUrl}/${defaultLocale}/memo/${id}` });
    // ▲▲▲ 여기까지 수정 ▲▲▲

  } catch (error) {
    console.error('Memo creation failed:', error);
    return NextResponse.json({ error: '메모 생성 중 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}