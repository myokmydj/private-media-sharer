// app/api/posts/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { db, sql } from '@vercel/postgres'; // ▼▼▼ 1. sql 헬퍼를 import 합니다. ▼▼▼
import bcrypt from 'bcryptjs';

// --- GET 함수는 변경 없음 (기존 코드 그대로) ---
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
    const userId = parseInt(session.user.id, 10);
    const postId = params.id;

    const result = await db.sql`
      SELECT 
        id, user_id, title, tags, content, thumbnail_url,
        is_thumbnail_blurred, is_content_spoiler, is_nsfw,
        font_family, dominant_color, text_color, visibility,
        (password IS NOT NULL) as has_password
      FROM posts 
      WHERE id = ${postId} AND user_id = ${userId};
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: '게시물을 찾을 수 없거나 권한이 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Get post failed:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// --- PUT 함수 (수정된 최종 버전) ---
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
    const userId = parseInt(session.user.id, 10);
    const postId = params.id;

    const body = await req.json();

    // 1. 업데이트할 필드와 값을 객체로 준비합니다. (DB 컬럼명과 일치시켜야 함)
    const updates: { [key: string]: any } = {
      title: body.title,
      tags: body.tags,
      content: body.content,
      thumbnail_url: body.thumbnailUrl,
      is_thumbnail_blurred: body.isThumbnailBlurred,
      is_content_spoiler: body.isContentSpoiler,
      is_nsfw: body.isNsfw,
      font_family: body.selectedFont,
      dominant_color: body.dominantColor,
      text_color: body.textColor,
      visibility: body.visibility,
    };

    // 2. 비밀번호 필드를 조건부로 추가합니다.
    if (body.password) {
      updates.password = await bcrypt.hash(body.password, 10);
    } else if (body.visibility !== 'password') {
      updates.password = null;
    }

    // 3. 쿼리 문자열의 SET 부분을 동적으로 생성합니다.
    // 예: "title" = $1, "tags" = $2, ...
    const setClauses = Object.keys(updates)
      .map((key, index) => `"${key}" = $${index + 1}`)
      .join(', ');

    // 4. 값 배열을 생성합니다.
    const values = Object.values(updates);

    // 5. WHERE 절에 필요한 값을 값 배열 뒤에 추가합니다.
    const whereClauseStartIndex = values.length + 1;
    values.push(postId);
    values.push(userId);

    // 6. 최종 쿼리 문자열을 조립합니다.
    const queryString = `
      UPDATE posts
      SET ${setClauses}
      WHERE id = $${whereClauseStartIndex} AND user_id = $${whereClauseStartIndex + 1}
    `;

    // 7. 쿼리 문자열과 값 배열을 db.query에 전달하여 실행합니다.
    const result = await db.query(queryString, values);

    if ((result?.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: '수정할 게시물을 찾을 수 없거나 권한이 없습니다.' }, { status: 404 });
    }
    
    const generatedUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/view/${postId}`;
    return NextResponse.json({ url: generatedUrl }, { status: 200 });

  } catch (error) {
    console.error('Update post failed:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}