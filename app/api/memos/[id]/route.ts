// app/api/memos/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await db.sql`
      SELECT 
        m.*, 
        u.name as author_name,
        u.image as author_image,
        u.header_image as author_header_image
      FROM memos m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ${params.id}
      LIMIT 1;
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: '메모를 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to fetch memo:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}