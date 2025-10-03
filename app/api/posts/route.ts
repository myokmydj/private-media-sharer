import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';

// sharp와 getContrastingTextColor 함수를 완전히 제거합니다.

export async function POST(request: Request) {
  try {
    // ▼▼▼ dominantColor와 textColor를 request body에서 직접 받습니다 ▼▼▼
    const { 
      title, tags, content, thumbnailUrl, 
      isThumbnailBlurred, isContentSpoiler, isNsfw,
      selectedFont, password,
      dominantColor, textColor // 클라이언트가 분석한 색상 값
    } = await request.json();

    if (!title || !content || !thumbnailUrl) {
      return NextResponse.json({ error: '제목, 내용, 대표 이미지는 필수입니다.' }, { status: 400 });
    }

    // 서버에서의 색상 분석 로직을 모두 삭제했습니다.

    let hashedPassword = null;
    if (password && password.length > 0) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const id = nanoid();

    await db.sql`
      INSERT INTO posts (id, title, tags, content, thumbnail_url, is_thumbnail_blurred, is_content_spoiler, is_nsfw, font_family, password, dominant_color, text_color)
      VALUES (${id}, ${title}, ${tags}, ${content}, ${thumbnailUrl}, ${isThumbnailBlurred}, ${isContentSpoiler}, ${isNsfw}, ${selectedFont}, ${hashedPassword}, ${dominantColor}, ${textColor});
    `;

    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const generatedUrl = `${baseUrl}/view/${id}`;

    return NextResponse.json({ success: true, url: generatedUrl });

  } catch (error) {
    console.error('Create Post API Error:', error);
    return NextResponse.json({ error: '게시물 생성 중 서버에서 에러가 발생했습니다.' }, { status: 500 });
  }
}