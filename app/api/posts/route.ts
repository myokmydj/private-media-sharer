import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const { title, content, thumbnailUrl } = await request.json();

    if (!title || !content || !thumbnailUrl) {
      return NextResponse.json({ error: '제목, 내용, 대표 이미지는 필수입니다.' }, { status: 400 });
    }

    const id = nanoid();

    await db.sql`
      INSERT INTO posts (id, title, content, thumbnail_url)
      VALUES (${id}, ${title}, ${content}, ${thumbnailUrl});
    `;

    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
      
    const generatedUrl = `${baseUrl}/view/${id}`;

    return NextResponse.json({ success: true, url: generatedUrl });

  } catch (error) {
    console.error('Create Post API Error:', error);
    return NextResponse.json({ error: '게시물 생성 중 서버에서 에러가 발생했습니다.' }, { status: 500 });
  }
}