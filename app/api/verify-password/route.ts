import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';
// ▼▼▼ import 경로만 변경 ▼▼▼
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { id, password } = await request.json();

    if (!id || !password) {
      return NextResponse.json({ error: 'ID와 비밀번호를 모두 입력해야 합니다.' }, { status: 400 });
    }

    const { rows } = await db.sql`SELECT password FROM posts WHERE id = ${id} LIMIT 1;`;

    if (rows.length === 0) {
      return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
    }

    const hashedPassword = rows[0].password;
    if (!hashedPassword) {
        return NextResponse.json({ error: '이 게시물에는 비밀번호가 설정되어 있지 않습니다.' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (isMatch) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
    }

  } catch (error) {
    console.error('Verify Password API Error:', error);
    return NextResponse.json({ error: '비밀번호 확인 중 서버 에러가 발생했습니다.' }, { status: 500 });
  }
}