import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { join } from 'path';
import * as fs from 'fs';

export const runtime = 'nodejs';

// 👇 두 개의 폰트 파일을 불러옵니다.
const fontBoldPath = join(process.cwd(), 'public', 'fonts', 'PretendardJP-Black.otf'); // 사용자님의 파일 이름으로
const fontRegularPath = join(process.cwd(), 'public', 'fonts', 'PretendardJP-Medium.otf'); // 사용자님의 파일 이름으로
const pretendardBold = fs.readFileSync(fontBoldPath);
const pretendardRegular = fs.readFileSync(fontRegularPath);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title') || '제목 없음';
    const artist = searchParams.get('artist');
    const imageUrl = searchParams.get('imageUrl');
    // 👇 새로운 파라미터 수신
    const isBlurred = searchParams.get('isBlurred') === 'true';
    const isSpoiler = searchParams.get('isSpoiler') === 'true';

    return new ImageResponse(
      (
        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#28234D', color: 'white', padding: '40px' }}>
          <div style={{ display: 'flex', width: '100%', height: '100%' }}>
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
                  // 👇 isBlurred 값에 따라 블러 효과 적용
                  filter: isBlurred ? 'blur(20px)' : 'none',
                }}
              />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '40px', flex: 1, justifyContent: 'space-between' }}>
              {/* 👇 상단 로고를 Font Awesome 음악 아이콘으로 교체 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', opacity: 0.8 }}>
                <svg xmlns="http://www.w3.org/2000/svg" height="80" width="80" viewBox="0 0 512 512" fill="white">
                  <path d="M499.1 6.3c-13.1-8.1-28.3-6.3-39.2 4.4L393.5 64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V128h6.5c13.8 0 26.1-8.1 31-20.5s.7-26.6-8.4-35.2L499.1 6.3zM23.1 406.3c-13.1-8.1-28.3-6.3-39.2 4.4L-82.5 464H-156c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V528h6.5c13.8 0 26.1-8.1 31-20.5s.7-26.6-8.4-35.2L23.1 406.3zM256 0c-17.7 0-32 14.3-32 32V480c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32z"/>
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', fontFamily: '"PretendardJP-Black"' }}>
                <div style={{ fontSize: '60px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
                  {title}
                </div>
                {/* 👇 isSpoiler 값에 따라 본문 또는 스포일러 문구 표시 */}
                {artist && (
                  <div style={{
                    fontSize: '40px',
                    marginTop: '10px',
                    opacity: 0.7,
                    wordBreak: 'break-all',
                    lineHeight: 1.3,
                    // 👇 얇은 폰트 적용
                    fontFamily: '"PretendardJP-Medium"',
                    fontWeight: 400,
                  }}>
                    {isSpoiler ? '내용이 가려졌습니다.' : artist}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100px', height: '100px', backgroundColor: 'white', borderRadius: '50%' }}>
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5.13965V18.8604C8 19.56 8.66274 20.0168 9.30852 19.642L20.6915 12.7816C21.3373 12.4078 21.3373 11.5922 20.6915 11.2184L9.30852 4.35795C8.66274 3.98317 8 4.44004 8 5.13965Z" fill="#28234D"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630, fonts: [{ name: 'PretendardJP-Black', data: pretendardBold, style: 'normal', weight: 800 }, { name: 'PretendardJP-Medium', data: pretendardRegular, style: 'normal', weight: 400 }] },
    );
  } catch (e: unknown) {
    if (e instanceof Error) console.error(`OG Image generation failed: ${e.message}`);
    else console.error('An unknown error occurred during OG Image generation');
    return new Response(`Failed to generate the image`, { status: 500 });
  }
}