// app/[locale]/view/[id]/page.tsx (전체 코드, 생략 없음)
import { notFound } from 'next/navigation';
import { db } from '@vercel/postgres';
import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import PostContent from './PostContent';
import PasswordProtect from './PasswordProtect';
import type { Post } from '@/types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

async function getPostData(id: string): Promise<Post | null> {
  noStore();
  try {
    const { rows } = await db.sql<Post>`
      SELECT 
        p.*, 
        u.name as author_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ${id}
      LIMIT 1;
    `;
    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    console.error("Database query failed:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = await getPostData(params.id);
  if (!post) {
    return { title: '게시물을 찾을 수 없습니다' };
  }
  const cleanDescriptionForOg = post.content ? post.content.replace(/!\[.*?\]\(.*?\)/g, '').replace(/<img[^>]*>/gi, '').replace(/블러\[.*?\]/g, '').replace(/[`*_{}[\]()#+\-.!]/g, '').replace(/\s+/g, ' ').trim().substring(0, 100) : '';
  const displayDescription = post.is_content_spoiler ? '내용이 가려졌습니다. 링크를 클릭해 확인하세요.' : cleanDescriptionForOg || '친구로부터 공유된 게시물을 확인하세요.';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}`;
  const ogImageUrl = new URL(`${baseUrl}/api/og`);
  ogImageUrl.searchParams.set('title', post.title);
  ogImageUrl.searchParams.set('imageUrl', post.thumbnail_url);
  ogImageUrl.searchParams.set('isBlurred', String(post.is_thumbnail_blurred));
  ogImageUrl.searchParams.set('isSpoiler', String(post.is_content_spoiler));
  ogImageUrl.searchParams.set('isNsfw', String(post.is_nsfw));
  if (post.tags) { ogImageUrl.searchParams.set('tags', post.tags); }
  if (post.dominant_color) { ogImageUrl.searchParams.set('bgColor', post.dominant_color); }
  if (post.text_color) { ogImageUrl.searchParams.set('textColor', post.text_color); }
  if (cleanDescriptionForOg) { ogImageUrl.searchParams.set('artist', cleanDescriptionForOg); }
  return { title: post.title, description: displayDescription, openGraph: { title: post.title, description: displayDescription, images: [ogImageUrl.toString()], type: 'article' }, twitter: { card: 'summary_large_image', title: post.title, description: displayDescription, images: [ogImageUrl.toString()] } };
}

async function checkPermission(post: Post, viewerId: number | null): Promise<boolean> {
  const authorId = post.user_id;
  if (post.visibility === 'public' || post.visibility === 'password' || !post.visibility) { return true; }
  if (!viewerId) return false;
  if (viewerId === authorId) return true;
  if (post.visibility === 'followers_only') {
    const result = await db.sql`SELECT 1 FROM follows WHERE follower_id = ${viewerId} AND following_id = ${authorId} LIMIT 1;`;
    return (result?.rowCount ?? 0) > 0;
  }
  if (post.visibility === 'mutuals_only') {
    const [viewerFollowsAuthor, authorFollowsViewer] = await Promise.all([
      db.sql`SELECT 1 FROM follows WHERE follower_id = ${viewerId} AND following_id = ${authorId} LIMIT 1;`,
      db.sql`SELECT 1 FROM follows WHERE follower_id = ${authorId} AND following_id = ${viewerId} LIMIT 1;`
    ]);
    return ((viewerFollowsAuthor?.rowCount ?? 0) > 0 && (authorFollowsViewer?.rowCount ?? 0) > 0);
  }
  return false;
}

export default async function ViewPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ? parseInt(session.user.id, 10) : null;
  const post = await getPostData(params.id);
  if (!post || !post.user_id) { notFound(); }
  const hasPermission = await checkPermission(post, viewerId);
  if (!hasPermission) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md p-8 text-center space-y-4 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800">접근 권한 없음</h2>
          <p className="text-gray-600">이 콘텐츠를 볼 수 있는 권한이 없습니다. 작성자를 팔로우하거나 로그인해야 할 수 있습니다.</p>
        </div>
      </main>
    );
  }
  return (
    <main className={`flex min-h-screen items-center justify-center bg-gray-100 py-8 px-4 ${post.font_family || 'font-pretendard'}`}>
      {post.password && post.visibility === 'password' ? (<PasswordProtect post={post} />) : (<PostContent post={post} />)}
    </main>
  );
}