// components/FollowListModal.tsx (덮어쓰기)
'use client';

import Image from 'next/image';
import Link from 'next/link';
import FollowButton from './FollowButton';
import { X } from 'lucide-react';
import { useParams } from 'next/navigation'; // useParams 추가

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
  const params = useParams(); // params 훅 사용
  const locale = params.locale; // locale 가져오기

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
            <X size={18} />
          </button>
        </div>
        <div className="p-2 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-10 text-center text-sm text-gray-500">Loading...</div>
          ) : users.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">No users found.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {users.map((user) => (
                <li key={user.id} className="flex items-center justify-between p-2">
                  {/* ▼▼▼ [수정] Link에 locale 추가 ▼▼▼ */}
                  <Link href={`/${locale}/profile/${user.id}`} className="flex items-center gap-3 group" onClick={onClose}>
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      <Image
                        src={user.image || '/default-avatar.png'}
                        alt={user.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <span className="font-medium text-sm text-gray-800 group-hover:underline">{user.name}</span>
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