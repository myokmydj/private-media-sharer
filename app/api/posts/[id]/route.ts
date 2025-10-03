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

// --- PUT 함수 (수정된 부분) ---
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

    const {
      title, tags, content, thumbnailUrl,
      isThumbnailBlurred, isContentSpoiler, isNsfw,
      selectedFont, password, dominantColor, textColor,
      visibility,
    } = await req.json();

    // ▼▼▼ 2. 업데이트할 필드들을 배열에 담습니다. ▼▼▼
    const setClauses = [
      sql`title = ${title}`,
      sql`tags = ${tags}`,
      sql`content = ${content}`,
      sql`thumbnail_url = ${thumbnailUrl}`,
      sql`is_thumbnail_blurred = ${isThumbnailBlurred}`,
      sql`is_content_spoiler = ${isContentSpoiler}`,
      sql`is_nsfw = ${isNsfw}`,
      sql`font_family = ${selectedFont}`,
      sql`dominant_color = ${dominantColor}`,
      sql`text_color = ${textColor}`,
      sql`visibility = ${visibility}`,
    ];

    // ▼▼▼ 3. 비밀번호 필드는 조건에 따라 배열에 추가합니다. ▼▼▼
    if (password) {
      // 새 비밀번호가 있으면 해싱하여 추가
      const hashedPassword = await bcrypt.hash(password, 10);
      setClauses.push(sql`password = ${hashedPassword}`);
    } else if (visibility !== 'password') {
      // 비밀번호가 없는 공개방식으로 변경 시, 비밀번호를 null로 초기화
      setClauses.push(sql`password = NULL`);
    }
    // (비밀번호 입력 없고, 여전히 'password' 공개 방식이면 아무것도 추가 안 함 -> 기존 값 유지)

    // ▼▼▼ 4. sql.join을 사용하여 모든 SET 절을 쉼표(,)로 안전하게 연결합니다. ▼▼▼
    const result = await db.query(sql`
      UPDATE posts
      SET ${sql.join(setClauses, ', ')}
      WHERE id = ${postId} AND user_id = ${userId};
    `);

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