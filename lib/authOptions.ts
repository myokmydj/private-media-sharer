// lib/authOptions.ts (수정 후)

import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
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
          // ▼▼▼ [수정] image 컬럼을 함께 조회합니다. ▼▼▼
          const result = await db.sql`
            SELECT id, name, email, password, role, image FROM users WHERE email = ${credentials.email}
          `;
          const user = result.rows[0];
          if (user && await bcrypt.compare(credentials.password, user.password)) {
            return {
              id: user.id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
              image: user.image, // ▼▼▼ [추가] image 정보를 반환 객체에 포함합니다. ▼▼▼
            };
          }
          return null;
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
        token.role = user.role;
        // ▼▼▼ [추가] user.image를 token.picture에 저장합니다. (next-auth 기본값) ▼▼▼
        if (user.image) {
            token.picture = user.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        // ▼▼▼ [추가] token.picture를 session.user.image에 저장합니다. ▼▼▼
        if (token.picture) {
            session.user.image = token.picture;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};