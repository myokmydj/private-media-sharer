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
        <div
          tw="w-full h-full flex bg-white"
          style={{ fontFamily: 'Freesentation', fontWeight: 400 }}
        >
          {/* 왼쪽 컬럼 (본문) */}
          <div tw="w-2/3 h-full flex flex-col justify-center bg-neutral-900 p-16 rounded-tr-2xl rounded-br-2xl relative">
            <div tw="text-4xl text-neutral-300 flex flex-wrap" style={{ lineHeight: 1.6 }}>
              {processedContent.map((part, i) => (
                <span key={i} tw={part.isSpoiler ? 'text-5xl' : ''}>{part.text}</span>
              ))}
            </div>
            <div tw="absolute bottom-8 left-16 text-xl text-neutral-400 bg-neutral-800/80 px-4 py-1 rounded-full">
              {userName}님의 메모
            </div>
          </div>

          {/* ▼▼▼ [핵심 수정] 오른쪽 컬럼 구조 변경 ▼▼▼ */}
          {/* 1. 오른쪽 컬럼에 relative를 추가해 자식 요소의 absolute 위치 기준점으로 만듭니다. */}
          <div tw="w-1/3 h-full flex flex-col relative"> 
            {/* 상단: 헤더 이미지 */}
            <div tw="w-full h-1/2 flex">
              <img src={headerImageSrc} tw="w-full h-full" style={{ objectFit: 'cover' }} />
            </div>
            {/* 하단: 닉네임 */}
            <div tw="w-full h-1/2 flex items-center justify-center">
              <span tw="text-5xl text-neutral-800" style={{ fontWeight: 900 }}>{userName}</span>
            </div>

            {/* 2. 프로필 이미지를 오른쪽 컬럼 내에서 절대 위치로 중앙에 배치합니다. */}
            <img
              src={profileImageSrc}
              tw="absolute rounded-full w-40 h-40 border-8 border-white"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                objectFit: 'cover'
              }}
            />
          </div>
          {/* ▲▲▲ 여기까지 수정 ▲▲▲ */}
        </div>
      ),
      {
        width: 1200,
        height: 630,
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