import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { join } from 'path';
import * as fs from 'fs';

export const runtime = 'nodejs';

const fontBoldPath = join(process.cwd(), 'public', 'fonts', 'PretendardJP-Black.otf');
const fontRegularPath = join(process.cwd(), 'public', 'fonts', 'PretendardJP-Medium.otf');
const pretendardBold = fs.readFileSync(fontBoldPath);
const pretendardRegular = fs.readFileSync(fontRegularPath);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title') || '제목 없음';
    const artist = searchParams.get('artist');
    const imageUrl = searchParams.get('imageUrl');
    const isBlurred = searchParams.get('isBlurred') === 'true';
    const isSpoiler = searchParams.get('isSpoiler') === 'true';
    // ▼▼▼ isNsfw 파라미터 수신 ▼▼▼
    const isNsfw = searchParams.get('isNsfw') === 'true';
    // ▲▲▲ isNsfw 파라미터 수신 ▲▲▲

    return new ImageResponse(
      (
        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#28234D', color: 'white', padding: '40px' }}>
          <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            {/* ▼▼▼ 이미지 래퍼 div 추가 ▼▼▼ */}
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
                    filter: isBlurred ? 'blur(20px)' : 'none',
                  }}
                />
              )}
              {/* ▼▼▼ NSFW 오버레이 추가 ▼▼▼ */}
              {isNsfw && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="100" width="100" viewBox="0 0 640 512" fill="white">
                    <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 48 320 48C250.5 48 186.2 66.4 130.5 100.8L38.8 5.1zM288 192a64 64 0 1 1 64 64a63.8 63.8 0 0 1-4.4-23.4L320 256a32 32 0 0 0 0-64l-8.3-1.4c-1.2.1-2.3.1-3.5.1zM320 352c-15.4 0-29.7-4.2-42.2-11.5L253.5 316.2c3.2 1.1 6.5 2 9.8 2.8l-12.2 12.2c-1.8-1.4-3.5-2.8-5.3-4.2c-1.2-.9-2.3-1.9-3.5-2.8l-16.7-13.9c-4.9-4.1-12.2-3.4-16.3 .8s-3.4 12.2 .8 16.3l16.7 13.9c7.9 6.5 16.2 12.5 24.9 17.8l2.2 1.3c17.6 10.5 37.4 16.3 58.3 16.3s40.7-5.8 58.3-16.3c8.7-5.2 17-11.2 24.9-17.8l16.7-13.9c4.9-4.1 5.6-11.4 1.5-16.3s-11.4-5.6-16.3-.8l-16.7 13.9c-1.2 1-2.3 1.9-3.5 2.8c-1.8 1.4-3.5 2.8-5.3 4.2l-12.2-12.2c3.3-.8 6.6-1.7 9.8-2.8l-24.3-24.3c-12.5 7.3-26.8 11.5-42.2 11.5z"/>
                  </svg>
                </div>
              )}
              {/* ▲▲▲ NSFW 오버레이 추가 ▲▲▲ */}
            </div>
            {/* ▲▲▲ 이미지 래퍼 div 추가 ▲▲▲ */}
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '40px', flex: 1, justifyContent: 'space-between' }}>
              {/* ... (나머지 부분은 변경 없음) ... */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', opacity: 0.8 }}>
                <svg xmlns="http://www.w3.org/2000/svg" height="80" width="80" viewBox="0 0 512 512" fill="white">
                  <path d="M499.1 6.3c-13.1-8.1-28.3-6.3-39.2 4.4L393.5 64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V128h6.5c13.8 0 26.1-8.1 31-20.5s.7-26.6-8.4-35.2L499.1 6.3z" />
                  <path d="M23.1 406.3c-13.1-8.1-28.3-6.3-39.2 4.4L-82.5 464H-156c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V528h6.5c13.8 0 26.1-8.1 31-20.5s.7-26.6-8.4-35.2L23.1 406.3z" />
                  <path d="M256 0c-17.7 0-32 14.3-32 32V480c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32z" />
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', fontFamily: '"PretendardJP-Black"' }}>
                <div style={{ fontSize: '60px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
                  {title}
                </div>
                {artist && (
                  <div style={{
                    fontSize: '40px',
                    marginTop: '10px',
                    opacity: 0.7,
                    wordBreak: 'break-all',
                    lineHeight: 1.3,
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