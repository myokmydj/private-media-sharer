// middleware.ts (수정 후)

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['ko', 'en', 'ja'];
const defaultLocale = 'ko';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // URL에 이미 로케일이 있는지 확인합니다.
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // 로케일이 없으면 기본 로케일로 리다이렉트합니다.
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // /api, /_next/static, /_next/image, /favicon.ico 를 제외한 모든 경로
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};