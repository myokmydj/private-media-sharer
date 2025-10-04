// app/api/og/memo/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

function parseContent(content: string, spoilerIcon: string) {
  const trimmedContent = content.length > 200 ? content.substring(0, 200) + '...' : content;
  const parts = trimmedContent.split(/(\|\|.*?\|\|)/g).filter(Boolean);
  
  return parts.map(part => {
    if (part.startsWith('||') && part.endsWith('||')) {
      return { isSpoiler: true, text: spoilerIcon };
    }
    return { isSpoiler: false, text: part };
  });
}

async function getImageBuffer(url: string | null, defaultImagePath: string, baseUrl: string): Promise<ArrayBuffer> {
    let imageUrl = url;
    if (url && url.startsWith('/')) {
        imageUrl = new URL(url, baseUrl).toString();
    }

    try {
        if (!imageUrl || !imageUrl.startsWith('http')) {
            throw new Error("Invalid or missing image URL, using fallback.");
        }
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image from ${imageUrl}`);
        }
        return await response.arrayBuffer();
    } catch (e) {
        console.warn(`Warning: ${(e as Error).message}. Fetching default image: ${defaultImagePath}`);
        const defaultUrl = new URL(defaultImagePath, baseUrl).toString();
        const response = await fetch(defaultUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch default image from ${defaultUrl}`);
        }
        return await response.arrayBuffer();
    }
}

export async function GET(req: NextRequest) {
  try {
    const { nextUrl } = req;
    const searchParams = nextUrl.searchParams;
    const baseUrl = nextUrl.origin;

    const userName = searchParams.get('userName');
    const userImage = searchParams.get('userImage');
    const userHeaderImage = searchParams.get('userHeaderImage');
    const content = searchParams.get('content') || '';
    const spoilerIcon = searchParams.get('spoilerIcon') || '🔑';

    if (!userName) {
      return new Response('User name is required', { status: 400 });
    }
    
    const processedContent = parseContent(content, spoilerIcon);

    // ▼▼▼ [수정] 얇은 폰트(Regular)와 굵은 폰트(Black)를 모두 불러옵니다. ▼▼▼
    const [regularFontData, blackFontData, headerImageBuffer, profileImageBuffer] = await Promise.all([
        fetch(new URL('/Freesentation-4Regular.ttf', baseUrl)).then(res => res.arrayBuffer()),
        fetch(new URL('/Freesentation-9Black.ttf', baseUrl)).then(res => res.arrayBuffer()),
        getImageBuffer(userHeaderImage, '/default-header.png', baseUrl),
        getImageBuffer(userImage, '/default-avatar.png', baseUrl)
    ]);

    const headerImageSrc = headerImageBuffer as any;
    const profileImageSrc = profileImageBuffer as any;

    return new ImageResponse(
      (
        // ▼▼▼ [수정] 전체 레이아웃과 폰트 스타일을 새 디자인에 맞게 변경합니다. ▼▼▼
        <div tw="flex w-full h-full bg-white" style={{ fontFamily: 'Freesentation', fontWeight: 400 }}>
          {/* 왼쪽 컬럼 (본문) */}
          <div tw="w-2/3 h-full flex flex-col justify-center bg-neutral-900 p-16 rounded-tr-2xl rounded-br-2xl relative">
            <div tw="text-4xl text-neutral-300 flex flex-wrap" style={{ lineHeight: 1.6 }}>
              {processedContent.map((part, i) => (
                <span key={i} tw={part.isSpoiler ? 'text-5xl' : ''}>{part.text}</span>
              ))}
            </div>
            {/* 메모 태그 */}
            <div tw="absolute bottom-8 left-16 text-xl text-neutral-400 bg-neutral-800/80 px-4 py-1 rounded-full">
              {userName}님의 메모
            </div>
          </div>

          {/* 오른쪽 컬럼 (헤더, 닉네임) */}
          <div tw="w-1/3 h-full flex flex-col">
            {/* 헤더 이미지 영역 */}
            <div tw="w-full h-1/2 flex">
              <img src={headerImageSrc} tw="w-full h-full" style={{ objectFit: 'cover' }} />
            </div>
            {/* 닉네임 영역 */}
            <div tw="w-full h-1/2 flex items-center justify-center">
              <span tw="text-5xl text-neutral-800" style={{ fontWeight: 900 }}>{userName}</span>
            </div>
          </div>

          {/* 프로필 사진 */}
          <img
            src={profileImageSrc}
            tw="absolute rounded-full w-40 h-40 border-8 border-white"
            style={{
              // 오른쪽 영역의 세로 중앙선에 위치하도록 top 값을 정확히 설정
              top: '315px', // 630px(전체 높이)의 절반
              left: '800px', // 1200px(전체 너비)의 2/3 지점
              transform: 'translate(-50%, -50%)',
              objectFit: 'cover'
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        // ▼▼▼ [수정] 두 가지 폰트 웨이트를 모두 등록합니다. ▼▼▼
        fonts: [
          { name: 'Freesentation', data: regularFontData, weight: 400, style: 'normal' },
          { name: 'Freesentation', data: blackFontData, weight: 900, style: 'normal' },
        ],
      }
    );
  } catch (e: any) {
    console.error(`OG Memo generation failed: ${e.message}`);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}