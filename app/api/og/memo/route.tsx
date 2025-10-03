// app/api/og/memo/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { db } from '@vercel/postgres';

export const runtime = 'edge';

// 스포일러 문법(||...||)을 파싱하는 함수
function parseContent(content: string, spoilerIcon: string) {
  const parts = content.split(/(\|\|.*\|\|)/g).filter(Boolean);
  return parts.map(part => {
    if (part.startsWith('||') && part.endsWith('||')) {
      return { isSpoiler: true, text: spoilerIcon };
    }
    return { isSpoiler: false, text: part };
  });
}

async function getImageBuffer(url: string | null, defaultImage: string): Promise<ArrayBuffer> {
    try {
        if (!url) throw new Error("No URL provided");
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch image");
        return await response.arrayBuffer();
    } catch (e) {
        const baseUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
        const defaultUrl = new URL(defaultImage, baseUrl).toString();
        const response = await fetch(defaultUrl);
        return await response.arrayBuffer();
    }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const content = searchParams.get('content') || '';
    const spoilerIcon = searchParams.get('spoilerIcon') || '🔑';

    if (!userId) {
      return new Response('User ID is required', { status: 400 });
    }

    const userResult = await db.sql`
      SELECT name, image, header_image FROM users WHERE id = ${parseInt(userId, 10)}
    `;
    if (userResult.rowCount === 0) {
      return new Response('User not found', { status: 404 });
    }
    const user = userResult.rows[0];
    
    const processedContent = parseContent(content.substring(0, 150), spoilerIcon);

    const [fontData, headerImageBuffer, profileImageBuffer] = await Promise.all([
        fetch(new URL('/Freesentation-7Bold.ttf', req.url)).then(res => res.arrayBuffer()),
        getImageBuffer(user.header_image, '/default-header.png'),
        getImageBuffer(user.image, '/default-avatar.png')
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
              <span tw="ml-6 text-5xl text-white font-bold">{user.name}</span>
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
        fonts: [{ name: 'Freesentation', data: fontData, weight: 700, style: 'normal' }],
      }
    );
  } catch (e: any) {
    console.error(`OG Memo generation failed: ${e.message}`);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}