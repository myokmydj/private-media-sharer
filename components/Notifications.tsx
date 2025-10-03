// components/Notifications.tsx (새 파일)
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  is_read: boolean;
  created_at: string;
  actor_id: number;
  actor_name: string;
}

export default function Notifications() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);


  const fetchNotifications = async () => {
    const res = await fetch('/api/notifications');
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    }
  };

  const handleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // 모달을 열 때 읽음 처리
      await fetch('/api/notifications/mark-as-read', { method: 'POST' });
      setUnreadCount(0);
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    if (notification.type === 'NEW_FOLLOWER') {
      return (
        <span>
          <strong className="font-semibold">{notification.actor_name}</strong>
          님이 회원님을 팔로우하기 시작했습니다.
        </span>
      );
    }
    return '새로운 알림이 있습니다.';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleOpen} className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200">
          <div className="p-3 font-semibold border-b">알림</div>
          <ul className="py-1 max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <li key={notif.id}>
                  <Link
                    href={`/profile/${notif.actor_id}`}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {getNotificationMessage(notif)}
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(notif.created_at).toLocaleString()}
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-gray-500 text-center">
                새로운 알림이 없습니다.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}