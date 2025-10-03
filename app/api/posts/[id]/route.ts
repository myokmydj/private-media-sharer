// app/api/posts/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { db } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

// --- 게시물 단일 조회 (GET) ---
// (수정 페이지 진입 시 데이터 로딩용)
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

    // ▼▼▼ 1. SELECT 쿼리에 visibility 추가 ▼▼▼
    // 보안을 위해 password 해시는 절대 클라이언트로 보내지 않습니다.
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


// --- 게시물 수정 (PUT) ---
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
      visibility, // ▼▼▼ 2. visibility 값 받기 ▼▼▼
    } = await req.json();

    // 비밀번호 업데이트 로직
    let passwordUpdateQuery = '';
    if (password) {
      // 새 비밀번호가 입력된 경우, 해싱하여 업데이트
      const hashedPassword = await bcrypt.hash(password, 10);
      passwordUpdateQuery = `, password = '${hashedPassword}'`;
    } else if (visibility !== 'password') {
      // 비밀번호가 없는 공개방식으로 변경 시, 비밀번호를 null로 초기화
      passwordUpdateQuery = `, password = NULL`;
    }
    // 비밀번호 입력이 없고, 여전히 password 공개 방식이면 -> 기존 비밀번호 유지 (아무것도 안 함)


    // ▼▼▼ 3. SQL UPDATE 문에 visibility 와 password 로직 추가 ▼▼▼
    const result = await db.sql`
      UPDATE posts
      SET
        title = ${title},
        tags = ${tags},
        content = ${content},
        thumbnail_url = ${thumbnailUrl},
        is_thumbnail_blurred = ${isThumbnailBlurred},
        is_content_spoiler = ${isContentSpoiler},
        is_nsfw = ${isNsfw},
        font_family = ${selectedFont},
        dominant_color = ${dominantColor},
        text_color = ${textColor},
        visibility = ${visibility}
        -- 동적으로 비밀번호 쿼리 부분을 추가합니다. SQL Injection에 안전합니다.
        ${db.sql([passwordUpdateQuery])}
      WHERE id = ${postId} AND user_id = ${userId};
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: '수정할 게시물을 찾을 수 없거나 권한이 없습니다.' }, { status: 404 });
    }
    
    const generatedUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/view/${postId}`;
    return NextResponse.json({ url: generatedUrl }, { status: 200 });

  } catch (error) {
    console.error('Update post failed:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}