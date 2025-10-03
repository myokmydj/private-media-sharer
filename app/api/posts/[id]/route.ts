import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// GET: 특정 게시물 정보 가져오기 (수정 페이지용)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { id } = params;

  try {
    const { rows } = await db.sql`
      SELECT * FROM posts WHERE id = ${id} AND user_id = ${userId} LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: '게시물을 찾을 수 없거나 수정 권한이 없습니다.' }, { status: 404 });
    }

    // 보안을 위해 비밀번호 해시는 반환하지 않습니다.
    const post = { ...rows[0], password: '' };

    return NextResponse.json(post);
  } catch (error) {
    console.error(`Get Post [${id}] API Error:`, error);
    return NextResponse.json({ error: '게시물 조회 중 서버 에러가 발생했습니다.' }, { status: 500 });
  }
}

// PUT: 게시물 정보 수정하기
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { id } = params;

  try {
    const {
      title, tags, content, thumbnailUrl,
      isThumbnailBlurred, isContentSpoiler, isNsfw,
      selectedFont, password,
      dominantColor, textColor
    } = await request.json();

    if (!title || !content || !thumbnailUrl) {
      return NextResponse.json({ error: '제목, 내용, 대표 이미지는 필수입니다.' }, { status: 400 });
    }

    // 수정하려는 게시물이 본인 소유인지 먼저 확인
    const { rows: existingPostRows } = await db.sql`
      SELECT id FROM posts WHERE id = ${id} AND user_id = ${userId} LIMIT 1;
    `;
    if (existingPostRows.length === 0) {
      return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
    }

    // ▼▼▼ 여기에 수정된 로직이 있습니다 ▼▼▼

    // 1. 비밀번호를 제외한 나머지 정보 먼저 업데이트
    await db.sql`
      UPDATE posts SET
        title = ${title},
        tags = ${tags},
        content = ${content},
        thumbnail_url = ${thumbnailUrl},
        is_thumbnail_blurred = ${isThumbnailBlurred},
        is_content_spoiler = ${isContentSpoiler},
        is_nsfw = ${isNsfw},
        font_family = ${selectedFont},
        dominant_color = ${dominantColor},
        text_color = ${textColor}
      WHERE id = ${id} AND user_id = ${userId};
    `;

    // 2. 비밀번호 필드가 있는 경우에만 별도로 업데이트
    if (password && password.length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.sql`
        UPDATE posts SET password = ${hashedPassword}
        WHERE id = ${id} AND user_id = ${userId};
      `;
    } else if (password === '') { // 비밀번호를 빈 문자열로 보냈다면 비밀번호 제거
      await db.sql`
        UPDATE posts SET password = NULL
        WHERE id = ${id} AND user_id = ${userId};
      `;
    }
    // 비밀번호 필드가 없으면(undefined 또는 null) 아무것도 하지 않음 (기존 비밀번호 유지)

    // ▲▲▲ 여기까지 수정 완료 ▲▲▲


    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const generatedUrl = `${baseUrl}/view/${id}`;

    return NextResponse.json({ success: true, url: generatedUrl });

  } catch (error) {
    console.error(`Update Post [${id}] API Error:`, error);
    return NextResponse.json({ error: '게시물 수정 중 서버 에러가 발생했습니다.' }, { status: 500 });
  }
}