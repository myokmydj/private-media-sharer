import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { 
      title, 
      content, 
      thumbnailUrl, 
      isThumbnailBlurred, 
      isContentSpoiler, 
      // ▼▼▼ isNsfw 값 수신 ▼▼▼
      isNsfw,
      // ▲▲▲ isNsfw 값 수신 ▲▲▲
      selectedFont,
      password
    } = await request.json();

    if (!title || !content || !thumbnailUrl) {
      return NextResponse.json({ error: '제목, 내용, 대표 이미지는 필수입니다.' }, { status: 400 });
    }

    let hashedPassword = null;
    if (password && password.length > 0) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const id = nanoid();

    await db.sql`
      -- ▼▼▼ is_nsfw 컬럼 추가 ▼▼▼
      INSERT INTO posts (id, title, content, thumbnail_url, is_thumbnail_blurred, is_content_spoiler, is_nsfw, font_family, password)
      VALUES (${id}, ${title}, ${content}, ${thumbnailUrl}, ${isThumbnailBlurred}, ${isContentSpoiler}, ${isNsfw}, ${selectedFont}, ${hashedPassword});
      -- ▲▲▲ is_nsfw 컬럼 추가 ▲▲▲
    `;

    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const generatedUrl = `${baseUrl}/view/${id}`;

    return NextResponse.json({ success: true, url: generatedUrl });

  } catch (error) {
    console.error('Create Post API Error:', error);
    return NextResponse.json({ error: '게시물 생성 중 서버에서 에러가 발생했습니다.' }, { status: 500 });
  }
}