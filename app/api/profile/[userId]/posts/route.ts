// app/api/profile/[userId]/posts/route.ts
import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const profileId = parseInt(params.userId, 10);
  if (isNaN(profileId)) {
    return NextResponse.json({ error: '잘못된 ID' }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ? parseInt(session.user.id, 10) : null;

  try {
    let postsResult;
    // 자신의 프로필을 보는 경우, 모든 게시물을 보여줍니다.
    if (viewerId === profileId) {
      postsResult = await db.sql`
        SELECT id, title, thumbnail_url, is_nsfw, is_thumbnail_blurred, visibility 
        FROM posts 
        WHERE user_id = ${profileId}
        ORDER BY created_at DESC;
      `;
    } else {
      // 다른 사람의 프로필을 보는 경우, 'public' 게시물만 보여줍니다.
      postsResult = await db.sql`
        SELECT id, title, thumbnail_url, is_nsfw, is_thumbnail_blurred, visibility
        FROM posts 
        WHERE user_id = ${profileId} AND visibility = 'public'
        ORDER BY created_at DESC;
      `;
    }
    return NextResponse.json(postsResult.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}