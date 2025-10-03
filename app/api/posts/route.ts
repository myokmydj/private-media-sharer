import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
// ▼▼▼ sharp와 getContrastingTextColor 함수 추가 ▼▼▼
import sharp from 'sharp';

function getContrastingTextColor(r: number, g: number, b: number): string {
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
// ▲▲▲ 여기까지 추가 ▲▲▲

export async function POST(request: Request) {
  try {
    const { 
      title, tags, content, thumbnailUrl, 
      isThumbnailBlurred, isContentSpoiler, isNsfw,
      selectedFont, password
    } = await request.json();

    if (!title || !content || !thumbnailUrl) {
      return NextResponse.json({ error: '제목, 내용, 대표 이미지는 필수입니다.' }, { status: 400 });
    }

    // ▼▼▼ 색상 분석 로직 추가 ▼▼▼
    let dominantColor: string | null = null;
    let textColor: string | null = null;
    try {
      const response = await fetch(thumbnailUrl);
      const imageBuffer = await response.arrayBuffer();
      const { dominant } = await sharp(Buffer.from(imageBuffer)).stats();
      const { r, g, b } = dominant;
      dominantColor = `rgb(${r}, ${g}, ${b})`;
      textColor = getContrastingTextColor(r, g, b);
    } catch (error) {
      console.error("게시물 생성 시 색상 분석 실패:", error);
      // 실패 시 기본값으로 진행
      dominantColor = '#28234D';
      textColor = '#FFFFFF';
    }
    // ▲▲▲ 여기까지 추가 ▲▲▲

    let hashedPassword = null;
    if (password && password.length > 0) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const id = nanoid();

    await db.sql`
      -- ▼▼▼ dominant_color, text_color 컬럼 추가 ▼▼▼
      INSERT INTO posts (id, title, tags, content, thumbnail_url, is_thumbnail_blurred, is_content_spoiler, is_nsfw, font_family, password, dominant_color, text_color)
      VALUES (${id}, ${title}, ${tags}, ${content}, ${thumbnailUrl}, ${isThumbnailBlurred}, ${isContentSpoiler}, ${isNsfw}, ${selectedFont}, ${hashedPassword}, ${dominantColor}, ${textColor});
      -- ▲▲▲ 여기까지 수정 ▲▲▲
    `;

    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const generatedUrl = `${baseUrl}/view/${id}`;

    return NextResponse.json({ success: true, url: generatedUrl });

  } catch (error) {
    console.error('Create Post API Error:', error);
    return NextResponse.json({ error: '게시물 생성 중 서버에서 에러가 발생했습니다.' }, { status: 500 });
  }
}