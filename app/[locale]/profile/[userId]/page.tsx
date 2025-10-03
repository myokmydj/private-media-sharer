// app/[locale]/profile/[userId]/page.tsx (덮어쓰기)
'use client'; 

import { useState, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import FollowButton from '@/components/FollowButton';
import FollowListModal, { FollowUser } from '@/components/FollowListModal';
import ProfileImageUploader from '@/components/ProfileImageUploader';
import type { Post } from '@/types';
import { Edit } from 'lucide-react';

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

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const profileId = parseInt(params.userId as string, 10);

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState<FollowUser[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);

  useEffect(() => {
    if (isNaN(profileId)) {
      notFound();
      return;
    }
    
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/profile/${profileId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setProfileData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [profileId]);

  const handleOpenModal = async (type: 'followers' | 'following') => {
    setModalTitle(type === 'followers' ? 'Followers' : 'Following');
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
    return <div className="min-h-screen pt-10 text-center">Loading...</div>;
  }

  if (!profileData) {
    return notFound();
  }

  const { user, posts, followerCount, followingCount, isFollowing } = profileData;
  const viewerId = session?.user?.id ? parseInt(session.user.id, 10) : null;
  const isOwnProfile = viewerId === user.id;

  return (
    <>
      <main className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            
            {isOwnProfile ? (
              <ProfileImageUploader 
                currentImageUrl={user.image}
                onUploadComplete={() => router.refresh()}
              />
            ) : (
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                <Image
                  src={user.image || '/default-avatar.png'}
                  alt={user.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            )}

            <div className="flex-grow text-center sm:text-left w-full">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              <div className="flex justify-center sm:justify-start space-x-4 mt-3 text-sm">
                <button onClick={() => handleOpenModal('followers')} className="text-gray-600 hover:text-gray-900">
                  <span className="font-semibold text-gray-800">{followerCount}</span> Followers
                </button>
                <button onClick={() => handleOpenModal('following')} className="text-gray-600 hover:text-gray-900">
                  <span className="font-semibold text-gray-800">{followingCount}</span> Following
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

        <h2 className="text-xl font-bold text-gray-800 mb-6 px-2">Public Posts</h2>
        {posts.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600">This user has no public posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <Link key={post.id} href={`/view/${post.id}`} className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
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
                <div className="p-4">
                  <h3 className="font-semibold text-base text-gray-800 truncate">{post.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
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