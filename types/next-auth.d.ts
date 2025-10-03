// types/next-auth.d.ts (수정 후)

import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

// role, image, header_image를 포함하도록 기존 타입을 확장합니다.
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      header_image?: string | null;
    } & DefaultSession['user']; // name, email, image 등 기본 속성 포함
  }

  interface User extends DefaultUser {
    role: string;
    header_image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: string;
    id: string;
    header_image?: string | null;
  }
}