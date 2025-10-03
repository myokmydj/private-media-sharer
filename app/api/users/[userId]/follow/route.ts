// app/api/users/[userId]/follow/route.ts (수정 후)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { db } from '@vercel/postgres';

export async function POST(
  request: Request,
  // ▼▼▼ [수정] params 타입을 { userId: string } 으로 변경합니다. ▼▼▼
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
  }

  const followerId = parseInt(session.user.id, 10);
  // ▼▼▼ [수정] params.targetUserId -> params.userId 로 변경합니다. ▼▼▼
  const followingId = parseInt(params.userId, 10);

  if (isNaN(followerId) || isNaN(followingId)) {
    return NextResponse.json({ error: '잘못된 사용자 ID입니다.' }, { status: 400 });
  }
  if (followerId === followingId) {
    return NextResponse.json({ error: '자기 자신을 팔로우할 수 없습니다.' }, { status: 400 });
  }

  const { action }: { action: 'follow' | 'unfollow' } = await request.json();

  try {
    if (action === 'follow') {
      await db.sql`
        INSERT INTO follows (follower_id, following_id)
        VALUES (${followerId}, ${followingId})
        ON CONFLICT (follower_id, following_id) DO NOTHING;
      `;
      
      await db.sql`
        INSERT INTO notifications (recipient_id, actor_id, type)
        VALUES (${followingId}, ${followerId}, 'NEW_FOLLOWER');
      `;

    } else if (action === 'unfollow') {
      await db.sql`
        DELETE FROM follows
        WHERE follower_id = ${followerId} AND following_id = ${followingId};
      `;
    } else {
      return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Follow action failed:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}