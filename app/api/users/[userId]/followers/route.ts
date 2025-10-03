// app/api/users/[userId]/followers/route.ts (새 파일)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { db } from '@vercel/postgres';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ? parseInt(session.user.id, 10) : null;
  const targetUserId = parseInt(params.userId, 10);

  if (isNaN(targetUserId)) {
    return NextResponse.json({ error: '잘못된 사용자 ID입니다.' }, { status: 400 });
  }

  try {
    const result = await db.sql`
      SELECT
        u.id,
        u.name,
        u.image,
        CASE WHEN f_viewer.follower_id IS NOT NULL THEN TRUE ELSE FALSE END AS "is_followed_by_viewer"
      FROM follows f_target
      JOIN users u ON f_target.follower_id = u.id
      LEFT JOIN follows f_viewer ON f_viewer.following_id = u.id AND f_viewer.follower_id = ${viewerId}
      WHERE f_target.following_id = ${targetUserId}
    `;

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch followers:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}