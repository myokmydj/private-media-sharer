// types/next-auth.d.ts (전체 수정)

import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

// role을 포함하도록 기존 타입을 확장합니다.
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string; // role 추가
    } & DefaultSession['user']; // name, email, image 등 기본 속성 포함
  }

  interface User extends DefaultUser {
    role: string; // role 추가
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: string; // role 추가
    id: string;
  }
}