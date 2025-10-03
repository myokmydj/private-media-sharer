// app/api/auth/[...nextauth]/route.ts (수정 후)

import NextAuth from 'next-auth';
// 1. 새로운 경로에서 authOptions를 import 합니다.
import { authOptions } from '@/lib/authOptions';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };