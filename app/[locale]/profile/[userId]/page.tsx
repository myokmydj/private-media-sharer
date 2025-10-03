// app/[locale]/profile/[userId]/page.tsx (덮어쓰기)
'use client'; 

import { useState, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import FollowButton from '@/components/FollowButton';
import FollowListModal, { FollowUser } from '@/components/FollowListModal';
import ProfileImageUploader from '@/components/ProfileImageUploader';
import ProfileHeaderUploader from '@/components/ProfileHeaderUploader';
import PostList from './PostList';
import MemoList from './MemoList';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  image: string | null;
  header_image: string | null;
}
interface ProfileData {
  user: UserProfile;
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
  const [activeTab, setActiveTab] = useState<'posts' | 'memos'>('posts');

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

  useEffect(() => {
    if (isNaN(profileId)) {
      notFound();
      return;
    }
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

  const { user, followerCount, followingCount, isFollowing } = profileData;
  const viewerId = session?.user?.id ? parseInt(session.user.id, 10) : null;
  const isOwnProfile = viewerId === user.id;

  const tabStyle = "px-4 py-2 text-sm font-semibold border-b-2 transition-colors";
  const activeTabStyle = "border-gray-800 text-gray-800";
  const inactiveTabStyle = "border-transparent text-gray-500 hover:text-gray-700";

  return (
    <>
      <main className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="bg-white rounded-xl border border-gray-200 mb-8">
          {isOwnProfile ? (
            <ProfileHeaderUploader 
              currentImageUrl={user.header_image}
              onUploadComplete={fetchProfileData}
            />
          ) : (
            <div 
              className="w-full h-48 bg-cover bg-center rounded-t-xl"
              style={{ backgroundImage: `url(${user.header_image || '/default-header.png'})` }}
            />
          )}
          
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 -mt-16 sm:-mt-12">
              {isOwnProfile ? (
                <ProfileImageUploader 
                  currentImageUrl={user.image}
                  onUploadComplete={fetchProfileData}
                />
              ) : (
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border-4 border-white">
                  <Image src={user.image || '/default-avatar.png'} alt={user.name} fill className="object-cover" sizes="96px" />
                </div>
              )}

              <div className="flex-grow text-center sm:text-left w-full pt-12 sm:pt-0">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                <div className="flex justify-center sm:justify-start space-x-4 mt-3 text-sm">
                  <button onClick={() => handleOpenModal('followers')} className="text-gray-600 hover:text-gray-900"><span className="font-semibold text-gray-800">{followerCount}</span> Followers</button>
                  <button onClick={() => handleOpenModal('following')} className="text-gray-600 hover:text-gray-900"><span className="font-semibold text-gray-800">{followingCount}</span> Following</button>
                </div>
              </div>
              <div className="flex-shrink-0">
                {!isOwnProfile && viewerId && (
                  <FollowButton targetUserId={user.id} isInitiallyFollowing={isFollowing} />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            <button onClick={() => setActiveTab('posts')} className={`${tabStyle} ${activeTab === 'posts' ? activeTabStyle : inactiveTabStyle}`}>Posts</button>
            <button onClick={() => setActiveTab('memos')} className={`${tabStyle} ${activeTab === 'memos' ? activeTabStyle : inactiveTabStyle}`}>Memos</button>
          </nav>
        </div>

        <div>
          {activeTab === 'posts' ? <PostList userId={profileId} /> : <MemoList userId={profileId} />}
        </div>
      </main>
      <FollowListModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle} users={modalUsers} isLoading={isModalLoading} />
    </>
  );
}