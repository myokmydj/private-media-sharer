import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 });
    }

    // 이메일 중복 확인
    const existingUser = await db.sql`SELECT * FROM users WHERE email = ${email}`;
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 409 });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    await db.sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
    `;

    return NextResponse.json({ success: true, message: '회원가입이 완료되었습니다.' });

  } catch (error) {
    console.error('Signup API Error:', error);
    return NextResponse.json({ error: '회원가입 중 서버 에러가 발생했습니다.' }, { status: 500 });
  }
}