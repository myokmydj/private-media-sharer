// app/api/og/route.tsx (최종 수정본)
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

function isColorDark(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance < 128;
}

async function getFontData(req: NextRequest, fontFamily: string) {
  const baseUrl = new URL(req.url).origin;

switch (fontFamily) {
    case 'Freesentation':
      const freesentation = await fetch(`${baseUrl}/Freesentation-9Black.ttf`).then((res) => res.arrayBuffer());
      return { name: 'Freesentation', data: freesentation, weight: 900 as const };
      
    case 'BookkMyungjo':
      const bookkMyungjo = await fetch(`${baseUrl}/BookkMyungjo_Bold.ttf`).then((res) => res.arrayBuffer());
      return { name: 'BookkMyungjo', data: bookkMyungjo, weight: 700 as const };

    case 'Paperozi':
       const paperozi = await fetch(`${baseUrl}/Paperlogy-9Black.ttf`).then((res) => res.arrayBuffer());
       return { name: 'Paperozi', data: paperozi, weight: 700 as const };

    case 'Pretendard':
    default:
      const pretendard = await fetch(`${baseUrl}/PretendardJP-Black.otf`).then((res) => res.arrayBuffer());
      return { name: 'Pretendard', data: pretendard, weight: 700 as const };
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title') || '제목을 입력해주세요';
    const imageUrl = searchParams.get('imageUrl');
    const tagsStr = searchParams.get('tags');
    const isBlurred = searchParams.get('isBlurred') === 'true';
    const isSpoiler = searchParams.get('isSpoiler') === 'true';
    const isNsfw = searchParams.get('isNsfw') === 'true';
    const artist = searchParams.get('artist');
    const bgColor = searchParams.get('bgColor') || '#28234D';
    const textColor = searchParams.get('textColor') || '#FFFFFF';
    const ogFont = searchParams.get('ogFont') || 'Pretendard';

    const tags = tagsStr ? tagsStr.split(',').map(tag => tag.trim()).filter(Boolean) : [];
    const fontData = await getFontData(req, ogFont);
    const previewText = artist || (isSpoiler ? '내용이 가려졌습니다.' : '');
    const isBgDark = isColorDark(bgColor);
    const tagBgColor = isBgDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';

    return new ImageResponse(
      (
        <div 
          style={{
            fontFamily: `"${fontData.name}"`,
            backgroundColor: bgColor,
            color: textColor,
          }}
          tw="flex w-full h-full p-12"
        >
          {/* 이미지 영역 (왼쪽) */}
          <div tw="w-1/2 h-full flex items-center justify-center pr-8">
              {imageUrl && (
                  <div tw="relative w-full h-full rounded-2xl overflow-hidden flex">
                      <img src={imageUrl} alt="" tw="w-full h-full object-cover" style={{ filter: isBlurred || isNsfw ? 'blur(24px)' : 'none' }} />
                      {isNsfw && (
                        // ▼▼▼ [수정] text-white 클래스를 추가하여 글자색을 흰색으로 고정합니다. ▼▼▼
                        <div tw="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 font-black text-8xl tracking-widest text-white">
                          NSFW
                        </div>
                        // ▲▲▲ 여기까지 수정 ▲▲▲
                      )}
                  </div>
              )}
          </div>

          {/* 텍스트 영역 (오른쪽) */}
          <div tw="w-1/2 h-full flex flex-col justify-between" style={{ fontWeight: fontData.weight }}>
              <div tw="flex justify-end text-4xl font-black tracking-wider opacity-80">
                PREVIEW
              </div>
              
              {/* 중앙 콘텐츠 */}
              <div tw="flex flex-col">
                  {tags.length > 0 && (
                      <div tw="flex flex-wrap gap-2 mb-4">
                          {tags.slice(0, 3).map((tag, i) => (
                              <span key={i} tw="text-lg px-3 py-1 rounded-full" style={{ backgroundColor: tagBgColor }}>{tag}</span>
                          ))}
                      </div>
                  )}
                  <h1 tw="text-6xl font-black break-words" style={{ lineHeight: 1.2 }}>{title}</h1>
                  {previewText && <p tw="text-2xl opacity-70 mt-4 line-clamp-2">{previewText}</p>}
              </div>

              <div tw="flex justify-end">
                <div tw="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: textColor }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill={bgColor}>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
              </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [{ name: fontData.name, data: fontData.data, weight: fontData.weight, style: 'normal' }],
      }
    );
  } catch (e: any) {
    console.error(`OG Image generation failed: ${e.message}`);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}