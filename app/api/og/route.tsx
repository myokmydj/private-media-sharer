// api/og/route.tsx (원래 코드로 복원)

import { ImageResponse } from 'next/og';
import { NextRequest, NextResponse } from 'next/server';
import { pretendardBold, pretendardRegular } from '@/.generated/fonts';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title') || '제목 없음';
    const artist = searchParams.get('artist');
    const imageUrl = searchParams.get('imageUrl');
    const isBlurred = searchParams.get('isBlurred') === 'true';
    const isSpoiler = searchParams.get('isSpoiler') === 'true';
    const isNsfw = searchParams.get('isNsfw') === 'true';
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',').map(tag => tag.trim()).filter(Boolean) : [];

    const backgroundColor = searchParams.get('bgColor') || '#28234D';
    const textColor = searchParams.get('textColor') || '#FFFFFF';

    let tagBackgroundColor = 'rgba(255, 255, 255, 0.15)';
    if (textColor === '#000000') {
      tagBackgroundColor = 'rgba(0, 0, 0, 0.1)';
    }
    const playButtonColor = backgroundColor;

    const previewText = artist
      ? artist
          .replace(/!\[.*?\]\(.*?\)/g, '')
          .replace(/<img[^>]*>/gi, '')
          .replace(/블러\[.*?\]/g, '')
          .replace(/\n/g, ' ')
          .trim()
      : '';

    return new ImageResponse(
      (
        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: backgroundColor, color: textColor, padding: '40px' }}>
          <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            <div style={{ position: 'relative', width: 550, height: 550, display: 'flex' }}>
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  width={550}
                  height={550}
                  style={{
                    borderRadius: '20px',
                    objectFit: 'cover',
                    filter: (isBlurred || isNsfw) ? 'blur(40px)' : 'none'
                  }}
                />
              )}
              {isNsfw && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    fontFamily: '"PretendardJP-Black"',
                    fontSize: '120px',
                    color: 'white',
                    letterSpacing: '0.1em',
                  }}>
                    NSFW
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '40px', flex: 1, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', opacity: 0.8 }}>
                <div style={{
                  fontFamily: '"PretendardJP-Black"',
                  fontSize: '36px',
                  color: textColor,
                  letterSpacing: '0.05em',
                }}>
                  PREVIEW
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', fontFamily: '"PretendardJP-Black"' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                  {tags.map((tag) => ( <div key={tag} style={{ display: 'flex', padding: '6px 16px', backgroundColor: tagBackgroundColor, borderRadius: '9999px', fontSize: '28px', fontFamily: '"PretendardJP-Medium"', fontWeight: 400, lineHeight: 1.2, }}>{tag}</div> ))}
                </div>
                <div style={{ fontSize: '60px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>{title}</div>
                {previewText && (<div style={{ fontSize: '40px', marginTop: '10px', opacity: 0.7, wordBreak: 'break-all', lineHeight: 1.3, fontFamily: '"PretendardJP-Medium"', fontWeight: 400, }}>{isSpoiler ? '내용이 가려졌습니다.' : previewText}</div>)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100px', height: '100px', backgroundColor: textColor, borderRadius: '50%' }}>
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5.13965V18.8604C8 19.56 8.66274 20.0168 9.30852 19.642L20.6915 12.7816C21.3373 12.4078 21.3373 11.5922 20.6915 11.2184L9.30852 4.35795C8.66274 3.98317 8 4.44004 8 5.13965Z" fill={playButtonColor}/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630, fonts: [{ name: 'PretendardJP-Black', data: pretendardBold.buffer, style: 'normal', weight: 800 }, { name: 'PretendardJP-Medium', data: pretendardRegular.buffer, style: 'normal', weight: 400 }] },
    );

  } catch (e: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    console.error(`OG 이미지 생성 실패: ${errorMessage}`);
    return new NextResponse(`Failed to generate the image: ${errorMessage}`, { status: 500 });
  }
}