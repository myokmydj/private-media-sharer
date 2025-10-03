// app/api/users/[userId]/follow/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { db } from '@vercel/postgres';

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const followerId = parseInt(session.user.id, 10);
    const followingId = parseInt(params.userId, 10);
    const { action } = await req.json(); // 'follow' or 'unfollow'

    if (followerId === followingId) {
      return NextResponse.json({ error: '자기 자신을 팔로우할 수 없습니다.' }, { status: 400 });
    }

    if (action === 'follow') {
      // ON CONFLICT DO NOTHING: 이미 팔로우 중이면 아무것도 하지 않음 (오류 방지)
      await db.sql`
        INSERT INTO follows (follower_id, following_id)
        VALUES (${followerId}, ${followingId})
        ON CONFLICT (follower_id, following_id) DO NOTHING;
      `;
    } else if (action === 'unfollow') {
      await db.sql`
        DELETE FROM follows
        WHERE follower_id = ${followerId} AND following_id = ${followingId};
      `;
    } else {
      return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Follow API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}