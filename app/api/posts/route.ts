// app/api/posts/route.ts (덮어쓰기)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { db } from '@vercel/postgres';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  try {
    const { 
      title, tags, content, thumbnailUrl,
      isThumbnailBlurred, isContentSpoiler, isNsfw,
      selectedFont, password, dominantColor, textColor, visibility,
      letterSpacing, lineHeight, ogFont
    } = await request.json();

    if (!title || !content || !thumbnailUrl) {
      return NextResponse.json({ error: '제목, 내용, 대표 이미지는 필수입니다.' }, { status: 400 });
    }

    const id = nanoid(21);
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    await db.sql`
      INSERT INTO posts (
        id, user_id, title, tags, content, thumbnail_url, 
        is_thumbnail_blurred, is_content_spoiler, is_nsfw, 
        font_family, password, dominant_color, text_color, visibility,
        letter_spacing, line_height, og_font
      ) VALUES (
        ${id}, ${userId}, ${title}, ${tags}, ${content}, ${thumbnailUrl}, 
        ${isThumbnailBlurred}, ${isContentSpoiler}, ${isNsfw}, 
        ${selectedFont}, ${hashedPassword}, 
        ${dominantColor}, ${textColor}, ${visibility},
        ${letterSpacing || 'normal'}, ${lineHeight || '1.75'}, ${ogFont || 'Pretendard'}
      );
    `;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}`;
    return NextResponse.json({ url: `${baseUrl}/view/${id}` });

  } catch (error) {
    console.error('Post creation failed:', error);
    return NextResponse.json({ error: '게시물 생성 중 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}