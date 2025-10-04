// app/[locale]/my-posts/page.tsx (덮어쓰기)
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { db } from '@vercel/postgres';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, PlusCircle, Eye, Lock, Users, UserCheck } from 'lucide-react';
import type { Post } from '@/types';

async function getMyPosts(userId: string): Promise<Post[]> {
  const result = await db.sql<Post>`
    SELECT * FROM posts 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  return result.rows;
}

// Helper component for displaying visibility status
const VisibilityIcon = ({ visibility }: { visibility?: string }) => {
  switch (visibility) {
    case 'public':
      return (
        <span title="전체 공개">
          <Eye size={14} className="text-gray-500" />
        </span>
      );
    case 'password':
      return (
        <span title="비밀번호">
          <Lock size={14} className="text-gray-500" />
        </span>
      );
    case 'followers_only':
      return (
        <span title="팔로워 공개">
          <Users size={14} className="text-gray-500" />
        </span>
      );
    case 'mutuals_only':
       return (
        <span title="맞팔로워 공개">
          <UserCheck size={14} className="text-gray-500" />
        </span>
      );
    default:
      return (
        <span title="전체 공개">
          <Eye size={14} className="text-gray-500" />
        </span>
      );
  }
};


export default async function MyPostsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect('/login?callbackUrl=/my-posts');
  }

  const userId = (session.user as any).id;
  const posts = await getMyPosts(userId);

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">내 포스트 보관함</h1>
        <Link href="/upload" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gray-800 rounded-lg shadow-sm hover:bg-gray-900">
          <PlusCircle size={16} />
          새 포스트
        </Link>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-xl border border-gray-200">
          <p className="text-gray-600">아직 작성한 포스트가 없습니다.</p>
          <Link href="/upload" className="mt-4 inline-block px-6 py-2 text-white bg-gray-800 rounded-md hover:bg-gray-900 text-sm font-semibold">
            첫 포스트 작성하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <Link href={`/view/${post.id}`} className="block">
                <div className="relative aspect-square">
                  <Image
                    src={post.thumbnail_url}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={`object-cover transition-transform group-hover:scale-105 ${post.is_nsfw || post.is_thumbnail_blurred ? 'blur-md' : ''}`}
                  />
                  {post.is_nsfw && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm tracking-widest">NSFW</div>}
                </div>
              </Link>
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <h2 className="font-semibold text-gray-800 truncate group-hover:underline">{post.title}</h2>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                    <VisibilityIcon visibility={post.visibility} />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Link href={`/edit/${post.id}`} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                    <Edit size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}