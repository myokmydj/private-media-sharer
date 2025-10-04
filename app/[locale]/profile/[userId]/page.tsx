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

  const tabStyle = "px-1 pb-2 text-sm font-semibold border-b-2 transition-colors";
  const activeTabStyle = "border-black text-black";
  const inactiveTabStyle = "border-transparent text-gray-500 hover:text-black";

  return (
    <>
      <main className="max-w-4xl mx-auto">
        <div className="bg-white border border-black mb-8">
          <div className="relative">
            {isOwnProfile ? (
              <ProfileHeaderUploader 
                currentImageUrl={user.header_image}
                onUploadComplete={fetchProfileData}
              />
            ) : (
              <div 
                className="w-full h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${user.header_image || '/default-header.png'})` }}
              />
            )}
            <div className="absolute -bottom-12 left-6">
              {isOwnProfile ? (
                <ProfileImageUploader 
                  currentImageUrl={user.image}
                  onUploadComplete={fetchProfileData}
                />
              ) : (
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white">
                  <Image src={user.image || '/default-avatar.png'} alt={user.name} fill className="object-cover" sizes="96px" />
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex justify-end mb-4">
              {!isOwnProfile && viewerId && (
                <FollowButton targetUserId={user.id} isInitiallyFollowing={isFollowing} />
              )}
            </div>
            <div className="pt-8">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500 mt-1 font-mono">{user.email}</p>
              <div className="flex space-x-4 mt-3 text-sm font-mono">
                <button onClick={() => handleOpenModal('followers')} className="text-gray-600 hover:text-black"><span className="font-semibold text-black">{followerCount}</span> Followers</button>
                <button onClick={() => handleOpenModal('following')} className="text-gray-600 hover:text-black"><span className="font-semibold text-black">{followingCount}</span> Following</button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-300 mb-6">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button onClick={() => setActiveTab('posts')} className={`${tabStyle} ${activeTab === 'posts' ? activeTabStyle : inactiveTabStyle}`}>POSTS</button>
            <button onClick={() => setActiveTab('memos')} className={`${tabStyle} ${activeTab === 'memos' ? activeTabStyle : inactiveTabStyle}`}>MEMOS</button>
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