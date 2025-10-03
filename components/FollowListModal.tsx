// components/FollowListModal.tsx (새 파일)
'use client';

import Image from 'next/image';
import Link from 'next/link';
import FollowButton from './FollowButton';
import { X } from 'lucide-react';

export interface FollowUser {
  id: number;
  name: string;
  image: string | null;
  is_followed_by_viewer: boolean;
}

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: FollowUser[];
  isLoading: boolean;
}

export default function FollowListModal({
  isOpen,
  onClose,
  title,
  users,
  isLoading,
}: FollowListModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <p className="text-center text-gray-500">불러오는 중...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-500">사용자가 없습니다.</p>
          ) : (
            <ul className="space-y-3">
              {users.map((user) => (
                <li key={user.id} className="flex items-center justify-between">
                  <Link href={`/profile/${user.id}`} className="flex items-center gap-3 group" onClick={onClose}>
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      <Image
                        src={user.image || '/default-avatar.png'} // 기본 아바타 이미지 경로
                        alt={user.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <span className="font-medium group-hover:underline">{user.name}</span>
                  </Link>
                  <FollowButton
                    targetUserId={user.id}
                    isInitiallyFollowing={user.is_followed_by_viewer}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}