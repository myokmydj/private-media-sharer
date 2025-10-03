import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { db } from '@vercel/postgres';
import Link from 'next/link';
import Image from 'next/image';
import { Edit } from 'lucide-react'; // 아이콘 추가

import type { Post } from '@/types';

async function getMyPosts(userId: string): Promise<Post[]> {
  const result = await db.sql<Post>`
    SELECT * FROM posts 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  return result.rows;
}

export default async function MyPostsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect('/login?callbackUrl=/my-posts');
  }

  const userId = (session.user as any).id;
  const posts = await getMyPosts(userId);

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">내 포스트 보관함</h1>
        
        {posts.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-600">아직 작성한 포스트가 없습니다.</p>
            <Link href="/upload" className="mt-4 inline-block px-6 py-2 text-white bg-gray-800 rounded-md hover:bg-gray-900">
              첫 포스트 작성하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="group bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <Link href={`/view/${post.id}`} className="block">
                  <div className="relative aspect-square">
                    <Image
                      src={post.thumbnail_url}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={`object-cover ${post.is_nsfw || post.is_thumbnail_blurred ? 'blur-md' : ''}`}
                    />
                    {post.is_nsfw && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">NSFW</div>}
                  </div>
                </Link>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <Link href={`/view/${post.id}`} className="block">
                    <h2 className="font-bold text-lg text-gray-800 truncate group-hover:underline">{post.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{new Date(post.created_at).toLocaleDateString()}</p>
                  </Link>
                  <div className="mt-4 flex justify-end">
                    <Link href={`/edit/${post.id}`} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                      <Edit size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}