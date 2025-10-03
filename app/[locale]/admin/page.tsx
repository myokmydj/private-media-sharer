// app/[locale]/admin/page.tsx

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // 세션이 없거나, 관리자가 아니면 홈페이지로 쫓아냅니다.
  if (!session || session.user?.role !== 'admin') {
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">관리자 대시보드</h1>
        <AdminDashboard />
      </div>
    </main>
  );
}