// app/api/profile/[userId]/posts/route.ts
import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const profileId = parseInt(params.userId, 10);
  if (isNaN(profileId)) {
    return NextResponse.json({ error: '잘못된 ID' }, { status: 400 });
  }

  try {
    const postsResult = await db.sql`
      SELECT id, title, thumbnail_url, is_nsfw, is_thumbnail_blurred 
      FROM posts 
      WHERE user_id = ${profileId} AND visibility = 'public'
      ORDER BY created_at DESC;
    `;
    return NextResponse.json(postsResult.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}