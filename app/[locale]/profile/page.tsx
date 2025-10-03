// app/[locale]/profile/page.tsx (새 파일)

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';

// 이 페이지는 사용자를 자신의 공개 프로필 페이지로 리디렉션하는 역할만 합니다.
export default async function MyProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    // 로그인하지 않은 사용자는 로그인 페이지로 보냅니다.
    // 로그인 후 다시 이 페이지로 돌아오도록 callbackUrl을 설정합니다.
    redirect('/login?callbackUrl=/profile');
  }

  // 로그인한 사용자는 자신의 공개 프로필 페이지로 리디렉트합니다.
  redirect(`/profile/${session.user.id}`);
}