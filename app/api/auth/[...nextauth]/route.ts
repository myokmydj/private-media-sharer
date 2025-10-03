// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth'; // 1. NextAuth를 import 합니다.
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

// authOptions는 export하지 않고, 이 파일 안에서만 사용하는 상수로 둡니다.
const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        try {
          const result = await db.sql`
            SELECT id, name, email, password, role FROM users WHERE email = ${credentials.email}
          `;
          const user = result.rows[0];

          if (user && await bcrypt.compare(credentials.password, user.password)) {
            return {
              id: user.id.toString(),
              name: user.name,
              email: user.email,
              role: user.role, // role을 반환 객체에 추가
            };
          } else {
            return null;
          }
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // authorize에서 반환된 role을 토큰에 저장
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// 2. authOptions를 사용하여 NextAuth 핸들러를 생성합니다.
const handler = NextAuth(authOptions);

// 3. 생성된 핸들러를 GET과 POST 요청에 대해 export 합니다.
export { handler as GET, handler as POST };