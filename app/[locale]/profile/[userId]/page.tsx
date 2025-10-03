// app/[locale]/profile/[userId]/page.tsx (수정 후)

'use client'; // ▼▼▼ 상호작용을 위해 클라이언트 컴포넌트로 전환 ▼▼▼

import { useState, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import FollowButton from '@/components/FollowButton';
import FollowListModal, { FollowUser } from '@/components/FollowListModal';
import ProfileImageUploader from '@/components/ProfileImageUploader';
import type { Post } from '@/types';

// 데이터 타입을 정의합니다.
interface UserProfile {
  id: number;
  name: string;
  email: string;
  image: string | null;
}
interface ProfileData {
  user: UserProfile;
  posts: Post[];
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

// 이 페이지는 클라이언트 컴포넌트가 되었으므로, 데이터 fetching을 useEffect 안에서 처리합니다.
export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const profileId = parseInt(params.userId as string, 10);

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState<FollowUser[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);

  useEffect(() => {
    if (isNaN(profileId)) {
      notFound();
      return;
    }

    // 서버 컴포넌트에서 하던 데이터 조회를 클라이언트에서 수행
    const fetchProfileData = async () => {
      try {
        const res = await fetch(`/api/profile/${profileId}`); // 이 API는 새로 만들어야 합니다.
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setProfileData(data);
      } catch (error) {
        console.error(error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [profileId, router]);

  const handleOpenModal = async (type: 'followers' | 'following') => {
    setModalTitle(type === 'followers' ? '팔로워' : '팔로잉');
    setIsModalOpen(true);
    setIsModalLoading(true);
    try {
      const res = await fetch(`/api/users/${profileId}/${type}`);
      const data = await res.json();
      setModalUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsModalLoading(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  }

  if (!profileData) {
    return notFound();
  }

  const { user, posts, followerCount, followingCount, isFollowing } = profileData;
  const viewerId = session?.user?.id ? parseInt(session.user.id, 10) : null;
  const isOwnProfile = viewerId === user.id;

  return (
    <>
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              
              {isOwnProfile ? (
                <ProfileImageUploader 
                  currentImageUrl={user.image}
                  onUploadComplete={() => router.refresh()}
                />
              ) : (
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                  <Image
                    src={user.image || '/default-avatar.png'}
                    alt={user.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              )}

              <div className="flex-grow text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500">{user.email}</p>
                <div className="flex justify-center sm:justify-start space-x-4 mt-2">
                  <button onClick={() => handleOpenModal('followers')} className="hover:underline">
                    <span className="font-semibold">{followerCount}</span> Followers
                  </button>
                  <button onClick={() => handleOpenModal('following')} className="hover:underline">
                    <span className="font-semibold">{followingCount}</span> Following
                  </button>
                </div>
              </div>
              <div className="flex-shrink-0">
                {!isOwnProfile && viewerId && (
                  <FollowButton targetUserId={user.id} isInitiallyFollowing={isFollowing} />
                )}
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
      <FollowListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        users={modalUsers}
        isLoading={isModalLoading}
      />
    </>
  );
}