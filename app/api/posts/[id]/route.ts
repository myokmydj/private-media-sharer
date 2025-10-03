// app/api/posts/[id]/route.ts (덮어쓰기)
import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import bcrypt from 'bcryptjs';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await db.sql`
      SELECT 
        p.*, 
        u.name as author_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ${params.id}
      LIMIT 1;
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  try {
    const postResult = await db.sql`SELECT * FROM posts WHERE id = ${params.id}`;
    if (postResult.rowCount === 0) {
      return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
    }
    const post = postResult.rows[0];
    if (post.user_id.toString() !== userId) {
      return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
    }

    const {
      title, tags, content, thumbnailUrl,
      isThumbnailBlurred, isContentSpoiler, isNsfw,
      selectedFont, password, dominantColor, textColor, visibility,
      letterSpacing, lineHeight, ogFont
    } = await request.json();

    const hashedPassword = password ? await bcrypt.hash(password, 10) : post.password;

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
        password = ${hashedPassword},
        dominant_color = ${dominantColor},
        text_color = ${textColor},
        visibility = ${visibility},
        letter_spacing = ${letterSpacing || 'normal'},
        line_height = ${lineHeight || '1.75'},
        og_font = ${ogFont || 'Pretendard'}
      WHERE id = ${params.id} AND user_id = ${userId};
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Post update failed:', error);
    return NextResponse.json({ error: '게시물 수정 중 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  try {
    const result = await db.sql`
      DELETE FROM posts 
      WHERE id = ${params.id} AND user_id = ${userId};
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: '게시물이 없거나 삭제 권한이 없습니다.' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Post deletion failed:', error);
    return NextResponse.json({ error: '게시물 삭제 중 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}