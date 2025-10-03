// app/api/admin/users/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@vercel/postgres';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // 1. 세션이 없거나, role이 'admin'이 아니면 거부
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  }

  try {
    // 2. 관리자일 경우에만 DB에서 모든 사용자 정보 조회 (비밀번호 제외)
    const result = await db.sql`
      SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC
    `;
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('관리자 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}