// app/api/notifications/mark-as-read/route.ts (새 파일)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { db } from '@vercel/postgres';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);

  try {
    await db.sql`
      UPDATE notifications
      SET is_read = TRUE
      WHERE recipient_id = ${userId} AND is_read = FALSE;
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark notifications as read:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}