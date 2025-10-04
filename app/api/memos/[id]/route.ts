// app/api/memos/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
  }
  const userId = parseInt(session.user.id, 10);

  try {
    const result = await db.sql`
      DELETE FROM memos 
      WHERE id = ${params.id} AND user_id = ${userId};
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: '메모가 없거나 삭제 권한이 없습니다.' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Memo deletion failed:', error);
    return NextResponse.json({ error: '메모 삭제 중 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}