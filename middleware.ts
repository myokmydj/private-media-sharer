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
    // ▼▼▼ [수정] 아래 matcher의 정규식을 수정합니다. ▼▼▼
    // api, _next/static, _next/image, favicon.ico 및 확장자가 있는 파일(이미지 등)을 제외
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    // ▲▲▲ 여기까지 수정 ▲▲▲
  ],
};