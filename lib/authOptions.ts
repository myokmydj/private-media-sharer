// lib/authOptions.ts (내용 최종 확인)

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
          const result = await db.sql`
            SELECT id, name, email, password, role FROM users WHERE email = ${credentials.email}
          `;
          const user = result.rows[0];
          if (user && await bcrypt.compare(credentials.password, user.password)) {
            // authorize에서는 반드시 User 타입과 일치하는 객체를 반환해야 합니다.
            return {
              id: user.id.toString(),
              name: user.name,
              email: user.email,
              role: user.role, // role 포함
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
      // user 객체는 로그인 시에만 전달됩니다.
      if (user) {
        token.id = user.id;
        token.role = user.role; // user 객체의 role을 token에 저장
      }
      return token;
    },
    async session({ session, token }) {
      // token의 정보를 session.user에 복사합니다.
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};