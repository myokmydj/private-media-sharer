// app/[locale]/profile/[userId]/page.tsx (수정)

import { db } from '@vercel/postgres';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import Image from 'next/image';
import Link from 'next/link';
import FollowButton from '@/components/FollowButton';
import type { Post } from '@/types';
// ▼▼▼ [추가] next/cache에서 unstable_noStore를 import합니다. ▼▼▼
import { unstable_noStore as noStore } from 'next/cache';

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

async function getProfileData(userId: number) {
  // ▼▼▼ [추가] 함수 맨 위에 noStore()를 호출하여 데이터 캐싱을 방지합니다. ▼▼▼
  noStore();
  
  const userResult = await db.sql<UserProfile>`SELECT id, name, email FROM users WHERE id = ${userId} LIMIT 1;`;
  if (userResult.rowCount === 0) return null;
  
  const postsResult = await db.sql<Post>`
    SELECT id, title, thumbnail_url, is_nsfw, is_thumbnail_blurred 
    FROM posts 
    WHERE user_id = ${userId} AND visibility = 'public'
    ORDER BY created_at DESC;
  `;

  const followerCountResult = await db.sql`SELECT COUNT(*) FROM follows WHERE following_id = ${userId};`;
  const followingCountResult = await db.sql`SELECT COUNT(*) FROM follows WHERE follower_id = ${userId};`;

  return {
    user: userResult.rows[0],
    posts: postsResult.rows,
    followerCount: parseInt(followerCountResult.rows[0].count, 10),
    followingCount: parseInt(followingCountResult.rows[0].count, 10),
  };
}

// ... 이하 나머지 코드는 기존과 동일합니다.
export default async function ProfilePage({ params }: { params: { userId: string } }) {
  const profileId = parseInt(params.userId, 10);
  if (isNaN(profileId)) notFound();

  const profileData = await getProfileData(profileId);
  if (!profileData) notFound();

  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ? parseInt(session.user.id, 10) : null;
  
  let isFollowing = false;
  if (viewerId) {
    const followCheck = await db.sql`
      SELECT 1 FROM follows WHERE follower_id = ${viewerId} AND following_id = ${profileId} LIMIT 1;
    `;
    isFollowing = (followCheck?.rowCount ?? 0) > 0;
  }
  
  const { user, posts, followerCount, followingCount } = profileData;

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-24 h-24 bg-gray-300 rounded-full flex-shrink-0">
              {/* Future: User avatar */}
            </div>
            <div className="flex-grow text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500">{user.email}</p>
              <div className="flex justify-center sm:justify-start space-x-4 mt-2">
                <p><span className="font-semibold">{followerCount}</span> Followers</p>
                <p><span className="font-semibold">{followingCount}</span> Following</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <FollowButton targetUserId={user.id} isInitiallyFollowing={isFollowing} />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Public Posts</h2>
        {posts.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-600">This user has no public posts yet.</p>
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
                <div className="p-4 flex-grow">
                  <Link href={`/view/${post.id}`} className="block">
                    <h3 className="font-bold text-lg text-gray-800 truncate group-hover:underline">{post.title}</h3>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}