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
    const isNsfw = searchParams.get('isNsfw') === 'true';
    // ▼▼▼ tags 파라미터 수신 및 처리 ▼▼▼
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',').map(tag => tag.trim()).filter(Boolean) : [];
    // ▲▲▲ tags 파라미터 수신 및 처리 ▲▲▲

    return new ImageResponse(
      (
        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#28234D', color: 'white', padding: '40px' }}>
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
                    filter: isBlurred ? 'blur(40px)' : 'none',
                  }}
                />
              )}
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
                  <svg xmlns="http://www.w3.org/2000/svg" height="150" width="150" viewBox="0 0 640 512" fill="white">
                    <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7C559.7 341.5 584 285.4 597.8 232.2c1.1-4.4 1.1-9.1 0-13.5C580.5 164.6 539.4 96 468.6 41.2C408.4-1.9 344.7-13.5 283.5 1.7L38.8 5.1zM240 128a128 128 0 0 0-93.5 210.3L209.2 282c-10-24-8.5-52.3 5.8-74.3s38.3-36.8 63-38.2l51.9-41.5C301.7 132 272.1 128 240 128zM320 384c-35.3 0-68.7-12.1-96.6-33.9L262 311.9c13.4 10.9 30.6 17.1 48.8 17.1c52.9 0 96-43.1 96-96c0-18.2-5.2-35.4-14.2-50.2L427.2 215c15.2 21.5 24.8 47.3 24.8 74.2c0 88.4-71.6 160-160 160z"/>
                  </svg>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '40px', flex: 1, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', opacity: 0.8 }}>
                <svg xmlns="http://www.w3.org/2000/svg" height="80" width="80" viewBox="0 0 384 512" fill="white">
                  <path d="M32 64C32 46.3 46.3 32 64 32H192c17.7 0 32 14.3 32 32V288c0 35.3-28.7 64-64 64s-64-28.7-64-64V160H64c-17.7 0-32-14.3-32-32s14.3-32 32-32h64V288c0 17.7 14.3 32 32 32s32-14.3 32-32V64H64V64zM0 448c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32z"/>
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', fontFamily: '"PretendardJP-Black"' }}>
                {/* ▼▼▼ 태그 렌더링 로직 추가 ▼▼▼ */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      style={{
                        display: 'flex',
                        padding: '6px 16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '9999px',
                        fontSize: '28px',
                        fontFamily: '"PretendardJP-Medium"',
                        fontWeight: 400,
                        lineHeight: 1.2,
                      }}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
                {/* ▲▲▲ 태그 렌더링 로직 추가 ▲▲▲ */}
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