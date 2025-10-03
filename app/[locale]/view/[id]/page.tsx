// app/[locale]/view/[id]/page.tsx

import { notFound } from 'next/navigation';
import { db } from '@vercel/postgres';
import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import PostContent from './PostContent';
import PasswordProtect from './PasswordProtect';
import type { Post } from '@/types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// ---------------- 데이터베이스 조회 함수 ----------------
async function getPostData(id: string): Promise<Post | null> {
  noStore(); // 이 페이지는 항상 동적으로 렌더링되도록 설정
  try {
    const { rows } = await db.sql<Post>`
      SELECT 
        *, 
        user_id, 
        visibility
      FROM posts 
      WHERE id = ${id} 
      LIMIT 1;
    `;
    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    console.error("Database query failed:", error);
    return null;
  }
}

// ---------------- 메타데이터 생성 함수 ----------------
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const post = await getPostData(params.id);

  if (!post) {
    return { title: '게시물을 찾을 수 없습니다' };
  }

  // OG 태그용 설명 텍스트 정제
  const cleanDescriptionForOg = post.content
    ? post.content
        .replace(/!\[.*?\]\(.*?\)/g, '') // 마크다운 이미지 제거
        .replace(/<img[^>]*>/gi, '')   // HTML 이미지 제거
        .replace(/블러\[.*?\]/g, '')     // 스포일러 태그 제거
        .replace(/[`*_{}[\]()#+\-.!]/g, '') // 특수문자 제거
        .replace(/\s+/g, ' ')           // 다중 공백을 단일 공백으로
        .trim()
        .substring(0, 100)
    : '';

  const displayDescription = post.is_content_spoiler 
    ? '내용이 가려졌습니다. 링크를 클릭해 확인하세요.' 
    : cleanDescriptionForOg || '친구로부터 공유된 게시물을 확인하세요.';

  // OG 이미지 URL 생성
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}`;
  const ogImageUrl = new URL(`${baseUrl}/api/og`);
  
  ogImageUrl.searchParams.set('title', post.title);
  ogImageUrl.searchParams.set('imageUrl', post.thumbnail_url);
  ogImageUrl.searchParams.set('isBlurred', String(post.is_thumbnail_blurred));
  ogImageUrl.searchParams.set('isSpoiler', String(post.is_content_spoiler));
  ogImageUrl.searchParams.set('isNsfw', String(post.is_nsfw));
  
  if (post.tags) {
    ogImageUrl.searchParams.set('tags', post.tags);
  }
  if (post.dominant_color) {
    ogImageUrl.searchParams.set('bgColor', post.dominant_color);
  }
  if (post.text_color) {
    ogImageUrl.searchParams.set('textColor', post.text_color);
  }
  if (cleanDescriptionForOg) {
    ogImageUrl.searchParams.set('artist', cleanDescriptionForOg);
  }

  return {
    title: post.title,
    description: displayDescription,
    openGraph: {
      title: post.title,
      description: displayDescription,
      images: [ogImageUrl.toString()],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: displayDescription,
      images: [ogImageUrl.toString()],
    },
  };
}


// ---------------- 접근 권한 확인 헬퍼 함수 ----------------
async function checkPermission(post: Post, viewerId: number | null): Promise<boolean> {
  const authorId = post.user_id;

  // 1. 전체 공개거나, 비밀번호가 있는 글은 일단 통과 (비밀번호 확인은 클라이언트에서)
  if (post.visibility === 'public' || post.visibility === 'password' || !post.visibility) {
    return true;
  }
  
  // 2. 로그인 안 한 유저는 비공개 글에 접근 불가
  if (!viewerId) return false;

  // 3. 글 작성자 본인은 무조건 통과
  if (viewerId === authorId) return true;

  // 4. 팔로워 공개 글일 경우
  if (post.visibility === 'followers_only') {
    const result = await db.sql`
      SELECT 1 FROM follows
      WHERE follower_id = ${viewerId} AND following_id = ${authorId}
      LIMIT 1;
    `;
    return (result?.rowCount ?? 0) > 0;
  }
  
  // 5. 맞팔로워 공개 글일 경우
  if (post.visibility === 'mutuals_only') {
    const [viewerFollowsAuthor, authorFollowsViewer] = await Promise.all([
      db.sql`
        SELECT 1 FROM follows
        WHERE follower_id = ${viewerId} AND following_id = ${authorId}
        LIMIT 1;
      `,
      db.sql`
        SELECT 1 FROM follows
        WHERE follower_id = ${authorId} AND following_id = ${viewerId}
        LIMIT 1;
      `
    ]);
    return (
      (viewerFollowsAuthor?.rowCount ?? 0) > 0 &&
      (authorFollowsViewer?.rowCount ?? 0) > 0
    );
  }

  return false; // 그 외의 경우는 모두 접근 불가
}


// ---------------- 페이지 메인 컴포넌트 ----------------
export default async function ViewPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ? parseInt(session.user.id, 10) : null;
  
  const post = await getPostData(params.id);
  if (!post || !post.user_id) {
    notFound();
  }

  const hasPermission = await checkPermission(post, viewerId);

  if (!hasPermission) {
    // 권한이 없을 때 보여줄 컴포넌트
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md p-8 text-center space-y-4 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800">접근 권한 없음</h2>
          <p className="text-gray-600">이 콘텐츠를 볼 수 있는 권한이 없습니다. 작성자를 팔로우하거나 로그인해야 할 수 있습니다.</p>
        </div>
      </main>
    );
  }

  // 권한이 있는 경우, 기존 렌더링 로직 수행
  return (
    <main className={`flex min-h-screen items-center justify-center bg-gray-100 py-8 px-4 ${post.font_family || 'font-pretendard'}`}>
      {post.password && post.visibility === 'password' ? (
        <PasswordProtect post={post} />
      ) : (
        <PostContent post={post} />
      )}
    </main>
  );
}