// app/api/og/memo/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

function parseContent(content: string, spoilerIcon: string) {
  const trimmedContent = content.length > 150 ? content.substring(0, 150) + '...' : content;
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
    // ▼▼▼ [수정] req 객체에서 직접 nextUrl을 가져오도록 수정합니다. ▼▼▼
    const { nextUrl } = req;
    const searchParams = nextUrl.searchParams;
    const baseUrl = nextUrl.origin;
    // ▲▲▲ 여기까지 수정 ▲▲▲

    const userName = searchParams.get('userName');
    const userImage = searchParams.get('userImage');
    const userHeaderImage = searchParams.get('userHeaderImage');
    const content = searchParams.get('content') || '';
    const spoilerIcon = searchParams.get('spoilerIcon') || '🔑';

    if (!userName) {
      return new Response('User name is required', { status: 400 });
    }
    
    const processedContent = parseContent(content, spoilerIcon);

    const [fontData, headerImageBuffer, profileImageBuffer] = await Promise.all([
        fetch(new URL('/Freesentation-9Black.ttf', baseUrl)).then(res => res.arrayBuffer()),
        getImageBuffer(userHeaderImage, '/default-header.png', baseUrl),
        getImageBuffer(userImage, '/default-avatar.png', baseUrl)
    ]);

    return new ImageResponse(
      (
        <div tw="flex flex-col w-full h-full bg-neutral-900" style={{ fontFamily: 'Freesentation' }}>
          <div tw="w-full h-[315px] flex">
            {/* @ts-ignore */}
            <img src={headerImageBuffer} tw="w-full h-full object-cover" />
          </div>
          <div tw="flex flex-col flex-grow p-16 pt-0">
            <div tw="flex items-center -mt-16">
              {/* @ts-ignore */}
              <img src={profileImageBuffer} tw="w-32 h-32 rounded-full border-8 border-neutral-900" />
              <span tw="ml-6 text-5xl text-white font-bold">{userName}</span>
            </div>
            <div tw="mt-10 text-4xl text-neutral-300 flex flex-wrap" style={{ lineHeight: 1.5 }}>
              {processedContent.map((part, i) => (
                <span key={i} tw={part.isSpoiler ? 'text-5xl' : ''}>{part.text}</span>
              ))}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [{ name: 'Freesentation', data: fontData, weight: 900, style: 'normal' }],
      }
    );
  } catch (e: any) {
    console.error(`OG Memo generation failed: ${e.message}`);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}