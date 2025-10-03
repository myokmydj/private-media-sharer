// app/api/posts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { db } from '@vercel/postgres';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
    const userId = parseInt(session.user.id, 10);

    const {
      title,
      tags,
      content,
      thumbnailUrl,
      isThumbnailBlurred,
      isContentSpoiler,
      isNsfw,
      selectedFont,
      password,
      dominantColor,
      textColor,
      visibility, // ▼▼▼ 1. visibility 값 받기 ▼▼▼
    } = await req.json();

    if (!title || !content || !thumbnailUrl) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
    }

    const postId = nanoid(12); // 12자리 고유 ID 생성

    // ▼▼▼ 2. 비밀번호가 있으면 해싱, 없으면 null 처리 ▼▼▼
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // ▼▼▼ 3. SQL INSERT 문에 visibility와 password 추가 ▼▼▼
    await db.sql`
      INSERT INTO posts (
        id, user_id, title, tags, content, thumbnail_url,
        is_thumbnail_blurred, is_content_spoiler, is_nsfw,
        font_family, password, dominant_color, text_color, visibility
      ) VALUES (
        ${postId}, ${userId}, ${title}, ${tags}, ${content}, ${thumbnailUrl},
        ${isThumbnailBlurred}, ${isContentSpoiler}, ${isNsfw},
        ${selectedFont}, ${hashedPassword}, ${dominantColor}, ${textColor}, ${visibility}
      );
    `;

    const generatedUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/view/${postId}`;

    return NextResponse.json({ url: generatedUrl }, { status: 201 });

  } catch (error) {
    console.error('Post creation failed:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}