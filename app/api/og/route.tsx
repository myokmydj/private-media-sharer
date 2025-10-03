import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { join } from 'path';
import * as fs from 'fs';

// Node.js 런타임 사용을 명시
export const runtime = 'nodejs';

// 폰트 파일 경로 설정
const fontPath = join(process.cwd(), 'public', 'fonts', 'Pretendard-Bold.otf');
const pretendardBold = fs.readFileSync(fontPath);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // URL 파라미터에서 제목과 아티스트(본문) 정보 가져오기
    const title = searchParams.get('title') || '제목 없음';
    const artist = searchParams.get('artist');
    const imageUrl = searchParams.get('imageUrl');

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#2d2d2dff', // 스포티파이 느낌의 짙은 남색
            fontFamily: '"Pretendard"',
            color: 'white',
            padding: '40px',
          }}
        >
          <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            {/* 왼쪽 앨범 아트 */}
            {imageUrl && (
              <img
                src={imageUrl}
                alt=""
                width={550}
                height={550}
                style={{ borderRadius: '20px', objectFit: 'cover' }}
              />
            )}

            {/* 오른쪽 정보 */}
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '40px', flex: 1, justifyContent: 'space-between' }}>
              {/* 상단 로고 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.486 2 2 6.486 2 12C2 17.514 6.486 22 12 22C17.514 22 22 17.514 22 12C22 6.486 17.514 2 12 2ZM16.89 16.275C16.695 16.613 16.238 16.738 15.899 16.544C13.335 15.014 10.163 14.65 6.015 15.548C5.618 15.64 5.226 15.353 5.134 14.956C5.043 14.559 5.33 14.167 5.727 14.075C10.28 13.103 13.793 13.495 16.665 15.212C17.003 15.406 17.127 15.863 16.89 16.275ZM18.23 13.18C17.97 13.586 17.417 13.738 17.01 13.478C14.025 11.64 9.698 11.21 5.815 12.219C5.35 12.338 4.898 12.018 4.778 11.553C4.659 11.088 4.979 10.636 5.444 10.517C9.848 9.413 14.65 9.896 18.045 11.98C18.451 12.24 18.593 12.774 18.23 13.18ZM18.383 9.971C14.948 7.846 8.943 7.355 5.215 8.401C4.681 8.543 4.171 8.204 4.029 7.67C3.887 7.136 4.226 6.626 4.76 6.484C9.013 5.325 15.638 5.868 19.608 8.284C20.082 8.566 20.25 9.15 19.968 9.624C19.686 10.098 19.1 10.266 18.383 9.971Z" fill="#FFFFFF"/>
                </svg>
              </div>
              
              {/* 중간 텍스트 */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '60px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
                  {title}
                </div>
                {artist && (
                  <div style={{ fontSize: '40px', marginTop: '10px', opacity: 0.7, wordBreak: 'break-all', lineHeight: 1.3 }}>
                    {artist}
                  </div>
                )}
              </div>

              {/* 하단 재생 버튼 */}
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
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Pretendard',
            data: pretendardBold,
            style: 'normal',
            weight: 800,
          },
        ],
      },
    );
  } catch (e: any) {
    console.error(`OG Image generation failed: ${e.message}`);
    return new Response(`Failed to generate the image`, { status: 500 });
  }
}