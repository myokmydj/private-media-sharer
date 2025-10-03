// app/api/profile/[userId]/route.ts (새 파일)
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
    const userResult = await db.sql`SELECT id, name, email, image FROM users WHERE id = ${profileId} LIMIT 1;`;
    if (userResult.rowCount === 0) {
      return NextResponse.json({ error: '사용자를 찾을 수 없음' }, { status: 404 });
    }
    
    const postsResult = await db.sql`
      SELECT id, title, thumbnail_url, is_nsfw, is_thumbnail_blurred 
      FROM posts 
      WHERE user_id = ${profileId} AND visibility = 'public'
      ORDER BY created_at DESC;
    `;

    const followerCountResult = await db.sql`SELECT COUNT(*) FROM follows WHERE following_id = ${profileId};`;
    const followingCountResult = await db.sql`SELECT COUNT(*) FROM follows WHERE follower_id = ${profileId};`;

    let isFollowing = false;
    if (viewerId) {
      const followCheck = await db.sql`SELECT 1 FROM follows WHERE follower_id = ${viewerId} AND following_id = ${profileId} LIMIT 1;`;
      isFollowing = (followCheck?.rowCount ?? 0) > 0;
    }

    const profileData = {
      user: userResult.rows[0],
      posts: postsResult.rows,
      followerCount: parseInt(followerCountResult.rows[0].count, 10),
      followingCount: parseInt(followingCountResult.rows[0].count, 10),
      isFollowing,
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}