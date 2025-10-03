import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const result = await db.sql`
            SELECT id, name, email, password FROM users WHERE email = ${credentials.email}
          `;

          const user = result.rows[0];

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          // authorize 함수는 비밀번호를 제외한 사용자 정보를 반환해야 합니다.
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
          };
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
  callbacks: {
    async jwt({ token, user }) {
      // 로그인 시 user 객체가 전달됩니다.
      if (user) {
        // DB에서 role을 조회해서 토큰에 추가
        const result = await db.sql`SELECT role FROM users WHERE id = ${user.id}`;
        if (result.rows.length > 0) {
          token.role = result.rows[0].role;
        }
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // JWT 토큰의 정보를 세션에 복사합니다.
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string; // 토큰의 role을 세션에 추가
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // 로그인 페이지 경로 지정
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };