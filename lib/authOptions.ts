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
          // ▼▼▼ [수정] image, header_image 컬럼을 함께 조회합니다. ▼▼▼
          const result = await db.sql`
            SELECT id, name, email, password, role, image, header_image FROM users WHERE email = ${credentials.email}
          `;
          const user = result.rows[0];
          if (user && await bcrypt.compare(credentials.password, user.password)) {
            return {
              id: user.id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
              image: user.image,
              header_image: user.header_image, // ▼▼▼ [추가] header_image 정보 포함 ▼▼▼
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
        if (user.image) {
            token.picture = user.image;
        }
        // ▼▼▼ [추가] user.header_image를 token에 저장합니다. ▼▼▼
        if (user.header_image) {
            token.header_image = user.header_image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        if (token.picture) {
            session.user.image = token.picture;
        }
        // ▼▼▼ [추가] token.header_image를 session.user에 저장합니다. ▼▼▼
        if (token.header_image) {
            session.user.header_image = token.header_image;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};