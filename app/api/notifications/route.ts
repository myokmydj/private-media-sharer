// app/api/notifications/route.ts (새 파일)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { db } from '@vercel/postgres';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);

  try {
    // 알림 목록 조회 (최신순)
    const notificationsResult = await db.sql`
      SELECT 
        n.id,
        n.type,
        n.is_read,
        n.created_at,
        u.id AS actor_id,
        u.name AS actor_name
      FROM notifications n
      JOIN users u ON n.actor_id = u.id
      WHERE n.recipient_id = ${userId}
      ORDER BY n.created_at DESC
      LIMIT 20;
    `;

    // 읽지 않은 알림 개수 조회
    const unreadCountResult = await db.sql`
      SELECT COUNT(*) FROM notifications
      WHERE recipient_id = ${userId} AND is_read = FALSE;
    `;

    return NextResponse.json({
      notifications: notificationsResult.rows,
      unreadCount: parseInt(unreadCountResult.rows[0].count, 10),
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}